import * as Notifications from 'expo-notifications'
import { supabase } from './supabase'
import { haversineDistanceKm } from '../utils/geo'
import { reverseGeocodeLabel } from './reverseGeocode'
import { upsertLiveStatus } from './liveStatus'
import { TRIP_DETECTION_CONFIG as cfg } from '../config/tripDetectionConfig'
import {
  getAutoTripContext,
  getAutoTripState,
  setAutoTripState,
  clearAutoTripState,
  type AutoTripContext,
  type AutoTripPoint,
  type AutoTripState,
} from './autoTripStorage'

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

function metersBetween(a: AutoTripPoint, b: AutoTripPoint): number {
  return haversineDistanceKm(a.latitude, a.longitude, b.latitude, b.longitude) * 1000
}

// Integrating the GPS chip's own Doppler-derived speed over elapsed time follows
// the actual road distance far better than summing straight-line hops between
// sparse fixes, which visibly cuts every corner on anything but a dead-straight
// road. Falls back to straight-line distance when speed data is missing or the
// gap between fixes is too large to treat as constant-speed travel. Shared by
// both the start-candidate distance accumulation and the active-trip odometer,
// so "how far has the vehicle gone" is computed the same way everywhere.
function computeSegmentDistanceKm(
  lastPoint: AutoTripPoint | null,
  lastSpeedMs: number | null,
  currentSpeedMs: number | null,
  currentPoint: AutoTripPoint,
  dtSeconds: number,
): number {
  if (!lastPoint) return 0
  const dtHours = dtSeconds / 3600
  const gapShortEnoughToIntegrate = dtSeconds > 0 && dtSeconds <= cfg.maxSegmentIntegrationGapSeconds
  if (
    gapShortEnoughToIntegrate &&
    currentSpeedMs != null && currentSpeedMs >= 0 &&
    lastSpeedMs != null && lastSpeedMs >= 0 &&
    dtHours > 0
  ) {
    const avgSpeedKmh = ((currentSpeedMs + lastSpeedMs) / 2) * 3.6
    return avgSpeedKmh * dtHours
  }
  return haversineDistanceKm(lastPoint.latitude, lastPoint.longitude, currentPoint.latitude, currentPoint.longitude)
}

async function notify(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null,
  })
}

// Duration is the span the vehicle was actually moving (startedAt to the last
// sample that counted as moving) — not startedAt to now, which would also bill
// the trailing stop-confirmation window used only to detect that the trip had
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
// progress. Throttled by progressUpdateMinIntervalSeconds (see persistInTripUpdate)
// so a live trip still visibly updates without writing on every single GPS fix.
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

async function endTrip(tripId: string, state: AutoTripState, sample: LocationSample) {
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

// A trip_waypoints row is only written once enough time or distance has passed
// since the last one (see tripDetectionConfig) — not on every raw GPS fix, which
// would otherwise mean a database write roughly every 5 seconds for an entire trip.
async function maybeWriteWaypoint(
  state: AutoTripState,
  sample: LocationSample,
  speedKmh: number,
): Promise<Pick<AutoTripState, 'lastWaypointAt' | 'lastWaypointPoint'> | null> {
  const currentPoint: AutoTripPoint = { latitude: sample.latitude, longitude: sample.longitude }
  const secondsSinceLast = state.lastWaypointAt != null ? (sample.timestamp - state.lastWaypointAt) / 1000 : Infinity
  const distanceSinceLast = state.lastWaypointPoint != null ? metersBetween(state.lastWaypointPoint, currentPoint) : Infinity
  const due = secondsSinceLast >= cfg.waypointMinIntervalSeconds || distanceSinceLast >= cfg.waypointMinDistanceMeters
  if (!due) return null

  const { error } = await supabase.from('trip_waypoints').insert({
    trip_id: state.activeTripId as string,
    lat: sample.latitude,
    lng: sample.longitude,
    speed_kmh: speedKmh,
    accuracy_m: sample.accuracyM,
  })
  if (error) console.warn('Auto-trip: failed to save waypoint', error.message)

  return { lastWaypointAt: sample.timestamp, lastWaypointPoint: currentPoint }
}

// Persists an in-trip state update once, and pushes it to the server only when
// progressUpdateMinIntervalSeconds has elapsed since the last push — keeps the
// AsyncStorage write on every fix (cheap, local) separate from the Supabase
// write (not cheap, metered), which is the main battery/data lever here.
async function persistInTripUpdate(
  tripId: string,
  state: AutoTripState,
  patch: Partial<AutoTripState>,
  sample: LocationSample,
): Promise<void> {
  const shouldPushProgress =
    state.lastProgressUpdateAt == null || (sample.timestamp - state.lastProgressUpdateAt) / 1000 >= cfg.progressUpdateMinIntervalSeconds

  const updated: AutoTripState = {
    ...state,
    ...patch,
    lastProgressUpdateAt: shouldPushProgress ? sample.timestamp : state.lastProgressUpdateAt,
  }
  await setAutoTripState(updated)
  if (shouldPushProgress) {
    await updateActiveTripProgress(tripId, updated)
  }
}

// A trip is only confirmed once the vehicle has held at/above the start speed
// continuously for both long enough AND far enough (see tripDetectionConfig) —
// a brief burst of speed alone (walking fast, being shuffled around a parking
// area, GPS drift) never reaches both bars together. The confirmed trip's
// start time/location are backdated to when movement actually began, and the
// distance/time already covered during the candidate window carries over
// rather than being discarded. Waypoints for that window aren't backfilled —
// the distance total already accounts for it, and it's not worth an extra
// batch of writes for a ~60-second/300m stretch of breadcrumb trail.
async function confirmTripStart(
  context: AutoTripContext,
  state: AutoTripState,
  sample: LocationSample,
  speedKmh: number,
): Promise<void> {
  const startTimestamp = state.startCandidateSince ?? sample.timestamp
  const startPoint = state.startCandidateAnchor ?? { latitude: sample.latitude, longitude: sample.longitude }
  const startLabel = await reverseGeocodeLabel(startPoint.latitude, startPoint.longitude)

  const { data: trip, error } = await supabase
    .from('vehicle_trips')
    .insert({
      driver_id: context.driverId,
      car_id: context.carId,
      application_id: context.applicationId,
      status: 'active',
      start_location: startLabel,
      started_at: new Date(startTimestamp).toISOString(),
    })
    .select()
    .single()

  if (error || !trip) {
    console.warn('Auto-trip: failed to start trip', error?.message)
    await setAutoTripState({
      ...state,
      phase: 'idle',
      startCandidateSince: null,
      startCandidateAnchor: null,
      startCandidateDistanceM: 0,
    })
    return
  }

  await setAutoTripState({
    ...state,
    phase: 'active',
    activeTripId: trip.id,
    startedAt: startTimestamp,
    lastMovingAt: sample.timestamp,
    lastSampleAt: sample.timestamp,
    distanceKm: state.startCandidateDistanceM / 1000,
    maxSpeedKmh: speedKmh,
    lastPoint: { latitude: sample.latitude, longitude: sample.longitude },
    lastSpeedMs: sample.speedMs,
    movingSeconds: (sample.timestamp - startTimestamp) / 1000,
    startCandidateSince: null,
    startCandidateAnchor: null,
    startCandidateDistanceM: 0,
  })

  await notify('Trip started', 'TrustMate Driver is tracking your route.')
}

// No vehicle_trips row exists yet — handles idle -> start_candidate -> active,
// or falling back to idle if the movement that triggered start_candidate
// doesn't sustain long enough / far enough to confirm a real trip.
async function processPreTripSample(
  context: AutoTripContext,
  state: AutoTripState,
  sample: LocationSample,
  speedKmh: number,
  dtSeconds: number,
): Promise<void> {
  const currentPoint: AutoTripPoint = { latitude: sample.latitude, longitude: sample.longitude }

  if (state.phase !== 'start_candidate') {
    if (speedKmh >= cfg.startSpeedKmh) {
      await setAutoTripState({
        ...state,
        phase: 'start_candidate',
        startCandidateSince: sample.timestamp,
        startCandidateAnchor: currentPoint,
        startCandidateDistanceM: 0,
        lastPoint: currentPoint,
        lastSampleAt: sample.timestamp,
        lastSpeedMs: sample.speedMs,
      })
      return
    }
    await setAutoTripState({ ...state, lastPoint: currentPoint, lastSampleAt: sample.timestamp, lastSpeedMs: sample.speedMs })
    return
  }

  // phase === 'start_candidate'
  if (speedKmh < cfg.startSpeedKmh) {
    // Movement didn't sustain — a brief burst, not a real trip starting.
    await setAutoTripState({
      ...state,
      phase: 'idle',
      startCandidateSince: null,
      startCandidateAnchor: null,
      startCandidateDistanceM: 0,
      lastPoint: currentPoint,
      lastSampleAt: sample.timestamp,
      lastSpeedMs: sample.speedMs,
    })
    return
  }

  const segmentKm = computeSegmentDistanceKm(state.lastPoint, state.lastSpeedMs, sample.speedMs, currentPoint, dtSeconds)
  const distanceM = state.startCandidateDistanceM + segmentKm * 1000
  const elapsedSeconds = state.startCandidateSince != null ? (sample.timestamp - state.startCandidateSince) / 1000 : 0

  if (elapsedSeconds >= cfg.startDurationSeconds && distanceM >= cfg.startDistanceMeters) {
    await confirmTripStart(context, { ...state, startCandidateDistanceM: distanceM }, sample, speedKmh)
    return
  }

  await setAutoTripState({
    ...state,
    startCandidateDistanceM: distanceM,
    lastPoint: currentPoint,
    lastSampleAt: sample.timestamp,
    lastSpeedMs: sample.speedMs,
  })
}

// A vehicle_trips row already exists — handles active <-> stop_candidate, and
// ending the trip once a stop is confirmed. Distance/moving-time stop
// accumulating the moment the vehicle looks stopped (entering stop_candidate)
// so GPS jitter while parked can't inflate the trip's totals.
async function processInTripSample(
  state: AutoTripState,
  sample: LocationSample,
  speedKmh: number,
  dtSeconds: number,
): Promise<void> {
  const tripId = state.activeTripId as string
  const currentPoint: AutoTripPoint = { latitude: sample.latitude, longitude: sample.longitude }
  const segmentKm = computeSegmentDistanceKm(state.lastPoint, state.lastSpeedMs, sample.speedMs, currentPoint, dtSeconds)
  const isMoving = speedKmh >= cfg.stopSpeedKmh

  if (state.phase === 'active') {
    if (!isMoving) {
      await persistInTripUpdate(
        tripId,
        state,
        {
          phase: 'stop_candidate',
          stopCandidateSince: sample.timestamp,
          stopCandidateAnchor: currentPoint,
          distanceKm: state.distanceKm + segmentKm,
          maxSpeedKmh: Math.max(state.maxSpeedKmh, speedKmh),
          lastPoint: currentPoint,
          lastSampleAt: sample.timestamp,
          lastSpeedMs: sample.speedMs,
        },
        sample,
      )
      return
    }

    await persistInTripUpdate(
      tripId,
      state,
      {
        distanceKm: state.distanceKm + segmentKm,
        maxSpeedKmh: Math.max(state.maxSpeedKmh, speedKmh),
        lastPoint: currentPoint,
        lastSampleAt: sample.timestamp,
        lastSpeedMs: sample.speedMs,
        lastMovingAt: sample.timestamp,
        movingSeconds: state.movingSeconds + (dtSeconds > 0 ? dtSeconds : 0),
      },
      sample,
    )
    return
  }

  // phase === 'stop_candidate'
  const distanceFromStopAnchor = state.stopCandidateAnchor ? metersBetween(state.stopCandidateAnchor, currentPoint) : 0
  const realMovementResumed = isMoving || distanceFromStopAnchor >= cfg.stopMovementRadiusMeters

  if (realMovementResumed) {
    await persistInTripUpdate(
      tripId,
      state,
      {
        phase: 'active',
        stopCandidateSince: null,
        stopCandidateAnchor: null,
        distanceKm: state.distanceKm + segmentKm,
        maxSpeedKmh: Math.max(state.maxSpeedKmh, speedKmh),
        lastPoint: currentPoint,
        lastSampleAt: sample.timestamp,
        lastSpeedMs: sample.speedMs,
        lastMovingAt: sample.timestamp,
        movingSeconds: state.movingSeconds + (dtSeconds > 0 ? dtSeconds : 0),
      },
      sample,
    )
    return
  }

  const stationarySeconds = state.stopCandidateSince != null ? (sample.timestamp - state.stopCandidateSince) / 1000 : 0
  if (stationarySeconds >= cfg.stopDurationSeconds) {
    await endTrip(tripId, state, sample)
    return
  }

  // Still within the stop-confirmation window — no real movement yet, don't
  // touch distance/moving time, just track the fix for the next comparison.
  await setAutoTripState({ ...state, lastPoint: currentPoint, lastSampleAt: sample.timestamp, lastSpeedMs: sample.speedMs })
}

export async function processLocationSample(sample: LocationSample): Promise<void> {
  const context = await getAutoTripContext()
  if (!context) return

  let state = await getAutoTripState()
  // The last sample's own GPS-fix time, not the last time it was moving — using
  // lastMovingAt here understated elapsed time (and so overstated speed) across
  // any stationary gap, since it wouldn't advance while the vehicle was stopped.
  const lastTimestamp = state.lastSampleAt ?? state.startedAt
  const speedKmh = speedKmhFromSample(sample, state.lastPoint, lastTimestamp)
  const dtSeconds = lastTimestamp != null ? (sample.timestamp - lastTimestamp) / 1000 : 0

  // A fix this imprecise, a speed this implausible, or a gap this small since the last
  // sample isn't trustworthy enough to move the live map, extend moving time, or shift
  // the reference point used to measure the next sample.
  const accuracyOk = sample.accuracyM == null || sample.accuracyM <= cfg.maxUsableAccuracyMeters
  const speedPlausible = speedKmh <= cfg.maxPlausibleSpeedKmh
  const gapLooksReal = lastTimestamp == null || dtSeconds >= cfg.minSampleGapSeconds
  const isSampleUsable = accuracyOk && speedPlausible && gapLooksReal

  // Live status is independent of trip state — owners need to see this even while
  // parked. Reuses the stop-speed threshold as the general "is it moving right now"
  // read, rather than introducing a third, separately-tuned speed constant.
  if (isSampleUsable) {
    await upsertLiveStatus(context, speedKmh >= cfg.stopSpeedKmh, speedKmh, sample)
  }

  if (state.activeTripId) {
    const waypointPatch = await maybeWriteWaypoint(state, sample, speedKmh)
    if (waypointPatch) state = { ...state, ...waypointPatch }
  }

  if (!isSampleUsable) {
    // Logged above for later debugging (if a waypoint was due), but not trusted
    // for anything state-changing — leave everything else as-is and wait for
    // the next sample that looks real.
    await setAutoTripState(state)
    return
  }

  if (!state.activeTripId) {
    await processPreTripSample(context, state, sample, speedKmh, dtSeconds)
  } else {
    await processInTripSample(state, sample, speedKmh, dtSeconds)
  }
}
