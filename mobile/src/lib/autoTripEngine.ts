import * as Notifications from 'expo-notifications'
import { supabase } from './supabase'
import { haversineDistanceKm } from '../utils/geo'
import { reverseGeocodeLabel } from './reverseGeocode'
import { reportPossibleCrash } from './crashAlert'
import { upsertLiveStatus } from './liveStatus'
import {
  getAutoTripContext,
  getAutoTripState,
  setAutoTripState,
  clearAutoTripState,
  type AutoTripPoint,
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

// Crash heuristic: highway-ish speed followed by the vehicle staying near-stationary for
// two consecutive samples (~60s). Requiring two samples (not one) filters out ordinary
// hard braking, sharp turns, and GPS jitter, which would otherwise look identical to a
// crash after just one reading. This is still a coarse GPS-only signal, so it will
// occasionally flag a stop that wasn't a crash — the confirm window keeps that
// low-friction (one tap to dismiss) rather than silently alerting anyone.
const CRASH_SPEED_BEFORE_KMH = 60
const CRASH_SPEED_AFTER_KMH = 8
const CRASH_CANDIDATE_SAMPLES = 2
export const CRASH_CONFIRM_WINDOW_MS = 30_000

export type LocationSample = {
  latitude: number
  longitude: number
  speedMs: number | null
  accuracyM: number | null
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
    lastSpeedKmh: null,
    crashPendingAt: null,
    crashCandidateCount: 0,
  })

  await notify('Trip started', 'TrustMate Driver is tracking your route.')
}

async function endTrip(tripId: string, state: Awaited<ReturnType<typeof getAutoTripState>>, sample: LocationSample) {
  // Duration is the span the vehicle was actually moving (startedAt to the
  // last sample that counted as moving) — not startedAt to now, which would
  // also bill the trailing IDLE_THRESHOLD_MS wait used only to detect that
  // the trip had ended, inflating every trip's recorded driving time by up
  // to 7 minutes.
  const durationSeconds = state.startedAt && state.lastMovingAt ? (state.lastMovingAt - state.startedAt) / 1000 : 0
  const avgSpeedKmh = durationSeconds > 0 ? state.distanceKm / (durationSeconds / 3600) : null
  const endLabel = await reverseGeocodeLabel(sample.latitude, sample.longitude)

  const { error } = await supabase
    .from('vehicle_trips')
    .update({
      ended_at: new Date().toISOString(),
      duration_seconds: Math.round(durationSeconds),
      distance_km: state.distanceKm,
      avg_speed_kmh: avgSpeedKmh,
      max_speed_kmh: state.maxSpeedKmh || null,
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

  // Live status is independent of trip state — owners need to see this even while parked.
  await upsertLiveStatus(context, isMoving, speedKmh, sample)

  if (!state.activeTripId) {
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

  let crashPendingAt = state.crashPendingAt
  let crashCandidateCount = state.crashCandidateCount
  if (crashPendingAt) {
    if (isMoving) {
      // Driver resumed normal driving — treat the earlier stop as a false alarm.
      crashPendingAt = null
    } else if (sample.timestamp - crashPendingAt >= CRASH_CONFIRM_WINDOW_MS) {
      await reportPossibleCrash(context, state.lastSpeedKmh ?? 0, sample)
      crashPendingAt = null
    }
  } else if (speedKmh <= CRASH_SPEED_AFTER_KMH) {
    // Only start (or continue) counting candidate samples if the vehicle was going fast
    // just before this streak began, or is already mid-streak from a prior fast reading.
    crashCandidateCount =
      crashCandidateCount > 0 || (state.lastSpeedKmh ?? 0) >= CRASH_SPEED_BEFORE_KMH ? crashCandidateCount + 1 : 0

    if (crashCandidateCount >= CRASH_CANDIDATE_SAMPLES) {
      crashPendingAt = sample.timestamp
      crashCandidateCount = 0
      await notify(
        'Possible crash detected',
        "Tap to confirm you're OK. TrustMate admin will be alerted if you don't respond.",
      )
    }
  } else {
    // Moving at a normal pace again — clear any in-progress candidate streak.
    crashCandidateCount = 0
  }

  const { error: waypointError } = await supabase.from('trip_waypoints').insert({
    trip_id: state.activeTripId,
    lat: sample.latitude,
    lng: sample.longitude,
    speed_kmh: speedKmh,
    accuracy_m: sample.accuracyM,
  })
  if (waypointError) console.warn('Auto-trip: failed to save waypoint', waypointError.message)

  // A fix this imprecise, or a speed this implausible, isn't trustworthy enough to
  // fold into the running distance/top-speed totals — but it still counts for the
  // moving/idle check above, since even a rough fix tells you the car is moving.
  const accuracyOk = sample.accuracyM == null || sample.accuracyM <= MAX_USABLE_ACCURACY_M
  const speedPlausible = speedKmh <= MAX_PLAUSIBLE_SPEED_KMH
  const isSampleUsable = accuracyOk && speedPlausible

  let segmentKm = 0
  if (isSampleUsable && state.lastPoint) {
    const currentSpeedMs = sample.speedMs
    const previousSpeedMs = state.lastSpeedMs
    const dtHours = lastTimestamp != null ? (sample.timestamp - lastTimestamp) / 3_600_000 : 0
    if (currentSpeedMs != null && currentSpeedMs >= 0 && previousSpeedMs != null && previousSpeedMs >= 0 && dtHours > 0) {
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
    maxSpeedKmh: isSampleUsable ? Math.max(state.maxSpeedKmh, speedKmh) : state.maxSpeedKmh,
    lastPoint: { latitude: sample.latitude, longitude: sample.longitude } satisfies AutoTripPoint,
    lastSampleAt: sample.timestamp,
    lastSpeedMs: sample.speedMs ?? null,
    lastMovingAt: isMoving ? sample.timestamp : state.lastMovingAt,
    lastSpeedKmh: speedKmh,
    crashPendingAt,
    crashCandidateCount,
  }

  const idleSince = sample.timestamp - (updatedState.lastMovingAt ?? sample.timestamp)
  if (idleSince > IDLE_THRESHOLD_MS) {
    await endTrip(state.activeTripId, updatedState, sample)
  } else {
    await setAutoTripState(updatedState)
  }
}
