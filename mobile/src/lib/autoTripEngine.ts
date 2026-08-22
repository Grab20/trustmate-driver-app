import * as Notifications from 'expo-notifications'
import { supabase } from './supabase'
import { haversineDistanceKm } from '../utils/geo'
import { reverseGeocodeLabel } from './reverseGeocode'
import { upsertLiveStatus } from './liveStatus'
import {
  getAutoTripContext,
  getAutoTripState,
  setAutoTripState,
  clearAutoTripState,
  type AutoTripPoint,
  type AutoTripState,
} from './autoTripStorage'

// A trip starts as soon as a single sample crosses this speed (device-reported GPS
// speed is trusted immediately; a stray false start just ends itself via idle timeout).
const MOVEMENT_THRESHOLD_KMH = 8
const MOVING_SAMPLES_TO_START = 1
// A trip ends once the vehicle has been below the movement threshold for this long.
const IDLE_THRESHOLD_MS = 7 * 60 * 1000
// A GPS fix worse than this is too imprecise to trust for distance/speed accumulation
// (still fine for a coarse moving/stationary check, just not for the running totals).
const MAX_USABLE_ACCURACY_M = 50
// Anything faster than this on a public road is virtually certain to be a GPS glitch
// (a jump to a distant point, or a corrupted Doppler speed reading), not a real speed.
const MAX_PLAUSIBLE_SPEED_KMH = 220
// Real fixes can't legitimately arrive faster than this given the ~5s sample interval
// requested from the OS. A gap smaller than this is the signature of a post-Doze/
// background-backlog flush: the OS hands back a batch of buffered fixes all at once,
// each carrying its own valid-looking historical speed/accuracy, but compressed into
// a few milliseconds of processing time instead of the real minutes or hours between
// them. Trusting that timing corrupts everything downstream — it lets "moving" time
// balloon for hours (each fix looks like a plausible speed reading) while the actual
// distance/duration math, which divides by that near-zero elapsed time, collapses
// toward zero. Below this floor a sample is still logged as a waypoint, but it's not
// trusted to move the live map, extend moving time, or shift the reference point used
// to measure the next sample.
const MIN_SAMPLE_GAP_S = 1
// Above this gap between two otherwise-trusted samples, don't integrate "average of
// the two endpoint speeds x elapsed time" — a real multi-hour tracking gap (phone
// backgrounded, Doze, etc.) would extrapolate to an absurd distance if treated as
// constant-speed travel for the whole gap. Fall back to the straight-line distance
// between the two points instead, same as when speed data is missing entirely.
const MAX_SEGMENT_INTEGRATION_GAP_S = 60

export type LocationSample = {
  latitude: number
  longitude: number
  speedMs: number | null
  accuracyM: number | null
  heading: number | null
  timestamp: number
}

function speedKmhFromSample(sample: LocationSample, lastPoint: AutoTripPoint | null, lastTimestamp: number | null) {
  if (sample.speedMs != null && sample.speedMs >= 0) {
    return sample.speedMs * 3.6
  }
  if (lastPoint && lastTimestamp) {
    const km = haversineDistanceKm(lastPoint.latitude, lastPoint.longitude, sample.latitude, sample.longitude)
    const hours = (sample.timestamp - lastTimestamp) / 3_600_000
    return hours > 0 ? km / hours : 0
  }
  return 0
}

async function notify(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null,
  })
}

async function startTrip(sample: LocationSample) {
  const context = await getAutoTripContext()
  if (!context) return

  const startLabel = await reverseGeocodeLabel(sample.latitude, sample.longitude)

  const { data: trip, error } = await supabase
    .from('vehicle_trips')
    .insert({
      driver_id: context.driverId,
      car_id: context.carId,
      application_id: context.applicationId,
      status: 'active',
      start_location: startLabel,
    })
    .select()
    .single()

  if (error || !trip) {
    console.warn('Auto-trip: failed to start trip', error?.message)
    return
  }

  await setAutoTripState({
    activeTripId: trip.id,
    // Anchor timing to the GPS fix's own timestamp, not the moment this code
    // happens to run — Android can queue several locations under Doze/battery
    // restrictions and deliver them as one batch, in which case Date.now()
    // would be identical for all of them and corrupt every duration/idle
    // calculation that follows.
    startedAt: sample.timestamp,
    lastMovingAt: sample.timestamp,
    lastSampleAt: sample.timestamp,
    distanceKm: 0,
    maxSpeedKmh: 0,
    lastPoint: { latitude: sample.latitude, longitude: sample.longitude },
    lastSpeedMs: sample.speedMs,
    consecutiveMovingSamples: 0,
    movingSeconds: 0,
  })

  await notify('Trip started', 'TrustMate Driver is tracking your route.')
}

// Duration is the span the vehicle was actually moving (startedAt to the last
// sample that counted as moving) — not startedAt to now, which would also bill
// the trailing IDLE_THRESHOLD_MS wait used only to detect that the trip had
// ended (or, for a still-active trip, however long it's simply been since the
// last sample), inflating recorded driving time.
function computeTripSnapshot(state: {
  startedAt: number | null
  lastMovingAt: number | null
  movingSeconds: number
  distanceKm: number
}) {
  const durationSeconds = state.startedAt && state.lastMovingAt ? (state.lastMovingAt - state.startedAt) / 1000 : 0
  const avgSpeedKmh = durationSeconds > 0 ? state.distanceKm / (durationSeconds / 3600) : null
  const idleSeconds = Math.max(0, durationSeconds - state.movingSeconds)
  return { durationSeconds, avgSpeedKmh, idleSeconds }
}

// The owner's app can't see the driver's local AsyncStorage trip state, so without
// this a trip in progress is invisible to them — their distance/duration totals only
// count trips that have already ended, while the driver's own screen shows live
// progress. Writing the running snapshot to the still-'active' trip row on every
// usable sample keeps both sides reading the same numbers from the same place.
async function updateActiveTripProgress(tripId: string, state: AutoTripState): Promise<void> {
  const { durationSeconds, avgSpeedKmh, idleSeconds } = computeTripSnapshot(state)

  const { error } = await supabase
    .from('vehicle_trips')
    .update({
      distance_km: state.distanceKm,
      duration_seconds: Math.round(durationSeconds),
      avg_speed_kmh: avgSpeedKmh,
      max_speed_kmh: state.maxSpeedKmh || null,
      idle_seconds: Math.round(idleSeconds),
    })
    .eq('id', tripId)

  if (error) console.warn('Auto-trip: failed to update live trip progress', error.message)
}

async function endTrip(tripId: string, state: Awaited<ReturnType<typeof getAutoTripState>>, sample: LocationSample) {
  const { durationSeconds, avgSpeedKmh, idleSeconds } = computeTripSnapshot(state)
  const endLabel = await reverseGeocodeLabel(sample.latitude, sample.longitude)

  const { error } = await supabase
    .from('vehicle_trips')
    .update({
      ended_at: new Date().toISOString(),
      duration_seconds: Math.round(durationSeconds),
      distance_km: state.distanceKm,
      avg_speed_kmh: avgSpeedKmh,
      max_speed_kmh: state.maxSpeedKmh || null,
      idle_seconds: Math.round(idleSeconds),
      end_location: endLabel,
      status: 'completed',
    })
    .eq('id', tripId)

  if (error) {
    console.warn('Auto-trip: failed to end trip', error.message)
    return
  }

  // Deliberately not touching vehicle_odometers here — automatic trips only have a
  // GPS-derived distance, not a real odometer reading. The odometer stays tied to
  // the manual weekly check-in flow, which is the only place with a trustworthy value.
  await clearAutoTripState()
  await notify('Trip completed', `Distance: ${state.distanceKm.toFixed(1)} km`)
}

export async function processLocationSample(sample: LocationSample): Promise<void> {
  const context = await getAutoTripContext()
  if (!context) return

  const state = await getAutoTripState()
  // The last sample's own GPS-fix time, not the last time it was moving — using
  // lastMovingAt here understated elapsed time (and so overstated speed) across
  // any stationary gap, since it wouldn't advance while the vehicle was stopped.
  const lastTimestamp = state.lastSampleAt ?? state.startedAt
  const speedKmh = speedKmhFromSample(sample, state.lastPoint, lastTimestamp)
  const isMoving = speedKmh >= MOVEMENT_THRESHOLD_KMH
  const dtSeconds = lastTimestamp != null ? (sample.timestamp - lastTimestamp) / 1000 : 0

  // A fix this imprecise, a speed this implausible, or a gap this small since the last
  // sample isn't trustworthy enough to move the live map, extend moving time, or shift
  // the reference point used to measure the next sample — see MIN_SAMPLE_GAP_S above.
  const accuracyOk = sample.accuracyM == null || sample.accuracyM <= MAX_USABLE_ACCURACY_M
  const speedPlausible = speedKmh <= MAX_PLAUSIBLE_SPEED_KMH
  const gapLooksReal = lastTimestamp == null || dtSeconds >= MIN_SAMPLE_GAP_S
  const isSampleUsable = accuracyOk && speedPlausible && gapLooksReal

  // Live status is independent of trip state — owners need to see this even while parked.
  if (isSampleUsable) {
    await upsertLiveStatus(context, isMoving, speedKmh, sample)
  }

  if (!state.activeTripId) {
    if (!isSampleUsable) return
    if (isMoving) {
      const consecutive = state.consecutiveMovingSamples + 1
      if (consecutive >= MOVING_SAMPLES_TO_START) {
        await startTrip(sample)
      } else {
        await setAutoTripState({ ...state, consecutiveMovingSamples: consecutive })
      }
    } else if (state.consecutiveMovingSamples !== 0) {
      await setAutoTripState({ ...state, consecutiveMovingSamples: 0 })
    }
    return
  }

  const { error: waypointError } = await supabase.from('trip_waypoints').insert({
    trip_id: state.activeTripId,
    lat: sample.latitude,
    lng: sample.longitude,
    speed_kmh: speedKmh,
    accuracy_m: sample.accuracyM,
  })
  if (waypointError) console.warn('Auto-trip: failed to save waypoint', waypointError.message)

  if (!isSampleUsable) {
    // Logged above for later debugging, but not trusted for anything state-changing —
    // leave everything as-is and wait for the next sample that looks real.
    return
  }

  let segmentKm = 0
  if (state.lastPoint) {
    const currentSpeedMs = sample.speedMs
    const previousSpeedMs = state.lastSpeedMs
    const dtHours = lastTimestamp != null ? (sample.timestamp - lastTimestamp) / 3_600_000 : 0
    const gapShortEnoughToIntegrate = dtSeconds > 0 && dtSeconds <= MAX_SEGMENT_INTEGRATION_GAP_S
    if (
      gapShortEnoughToIntegrate &&
      currentSpeedMs != null && currentSpeedMs >= 0 &&
      previousSpeedMs != null && previousSpeedMs >= 0 &&
      dtHours > 0
    ) {
      // Integrating the GPS chip's own Doppler-derived speed over elapsed time follows
      // the actual road distance far better than summing straight-line hops between
      // sparse fixes, which visibly cuts every corner on anything but a dead-straight road.
      const avgSpeedKmh = ((currentSpeedMs + previousSpeedMs) / 2) * 3.6
      segmentKm = avgSpeedKmh * dtHours
    } else {
      segmentKm = haversineDistanceKm(state.lastPoint.latitude, state.lastPoint.longitude, sample.latitude, sample.longitude)
    }
  }

  const updatedState = {
    ...state,
    distanceKm: state.distanceKm + segmentKm,
    maxSpeedKmh: Math.max(state.maxSpeedKmh, speedKmh),
    lastPoint: { latitude: sample.latitude, longitude: sample.longitude } satisfies AutoTripPoint,
    lastSampleAt: sample.timestamp,
    lastSpeedMs: sample.speedMs ?? null,
    lastMovingAt: isMoving ? sample.timestamp : state.lastMovingAt,
    movingSeconds: state.movingSeconds + (isMoving && dtSeconds > 0 ? dtSeconds : 0),
  }

  const idleSince = sample.timestamp - (updatedState.lastMovingAt ?? sample.timestamp)
  if (idleSince > IDLE_THRESHOLD_MS) {
    await endTrip(state.activeTripId, updatedState, sample)
  } else {
    await setAutoTripState(updatedState)
    await updateActiveTripProgress(state.activeTripId, updatedState)
  }
}
