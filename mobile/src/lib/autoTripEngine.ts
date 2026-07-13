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
    startedAt: Date.now(),
    lastMovingAt: Date.now(),
    distanceKm: 0,
    maxSpeedKmh: 0,
    lastPoint: { latitude: sample.latitude, longitude: sample.longitude },
    consecutiveMovingSamples: 0,
    lastSpeedKmh: null,
    crashPendingAt: null,
    crashCandidateCount: 0,
  })

  await notify('Trip started', 'TrustMate Driver is tracking your route.')
}

async function endTrip(tripId: string, state: Awaited<ReturnType<typeof getAutoTripState>>, sample: LocationSample) {
  const durationSeconds = state.startedAt ? (Date.now() - state.startedAt) / 1000 : 0
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
  const lastTimestamp = state.lastMovingAt ?? state.startedAt
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
    } else if (Date.now() - crashPendingAt >= CRASH_CONFIRM_WINDOW_MS) {
      await reportPossibleCrash(context, state.lastSpeedKmh ?? 0, sample)
      crashPendingAt = null
    }
  } else if (speedKmh <= CRASH_SPEED_AFTER_KMH) {
    // Only start (or continue) counting candidate samples if the vehicle was going fast
    // just before this streak began, or is already mid-streak from a prior fast reading.
    crashCandidateCount =
      crashCandidateCount > 0 || (state.lastSpeedKmh ?? 0) >= CRASH_SPEED_BEFORE_KMH ? crashCandidateCount + 1 : 0

    if (crashCandidateCount >= CRASH_CANDIDATE_SAMPLES) {
      crashPendingAt = Date.now()
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

  const segmentKm = state.lastPoint
    ? haversineDistanceKm(state.lastPoint.latitude, state.lastPoint.longitude, sample.latitude, sample.longitude)
    : 0

  const updatedState = {
    ...state,
    distanceKm: state.distanceKm + segmentKm,
    maxSpeedKmh: Math.max(state.maxSpeedKmh, speedKmh),
    lastPoint: { latitude: sample.latitude, longitude: sample.longitude } satisfies AutoTripPoint,
    lastMovingAt: isMoving ? Date.now() : state.lastMovingAt,
    lastSpeedKmh: speedKmh,
    crashPendingAt,
    crashCandidateCount,
  }

  const idleSince = Date.now() - (updatedState.lastMovingAt ?? Date.now())
  if (idleSince > IDLE_THRESHOLD_MS) {
    await endTrip(state.activeTripId, updatedState, sample)
  } else {
    await setAutoTripState(updatedState)
  }
}
