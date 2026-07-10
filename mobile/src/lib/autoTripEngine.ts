import * as Notifications from 'expo-notifications'
import { supabase } from './supabase'
import { haversineDistanceKm } from '../utils/geo'
import {
  getAutoTripContext,
  getAutoTripState,
  setAutoTripState,
  clearAutoTripState,
  type AutoTripPoint,
} from './autoTripStorage'

// A trip starts once the vehicle sustains this speed for MOVING_SAMPLES_TO_START
// consecutive location samples (avoids false starts from GPS jitter while parked).
const MOVEMENT_THRESHOLD_KMH = 8
const MOVING_SAMPLES_TO_START = 2
// A trip ends once the vehicle has been below the movement threshold for this long.
const IDLE_THRESHOLD_MS = 7 * 60 * 1000

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

  const { data: trip, error } = await supabase
    .from('vehicle_trips')
    .insert({
      driver_id: context.driverId,
      car_id: context.carId,
      application_id: context.applicationId,
      status: 'active',
      start_location: `${sample.latitude.toFixed(5)}, ${sample.longitude.toFixed(5)}`,
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
  })

  await notify('Trip started', 'TrustMate Driver is tracking your route.')
}

async function endTrip(tripId: string, state: Awaited<ReturnType<typeof getAutoTripState>>, sample: LocationSample) {
  const durationSeconds = state.startedAt ? (Date.now() - state.startedAt) / 1000 : 0
  const avgSpeedKmh = durationSeconds > 0 ? state.distanceKm / (durationSeconds / 3600) : null

  const { error } = await supabase
    .from('vehicle_trips')
    .update({
      ended_at: new Date().toISOString(),
      duration_seconds: Math.round(durationSeconds),
      distance_km: state.distanceKm,
      avg_speed_kmh: avgSpeedKmh,
      max_speed_kmh: state.maxSpeedKmh || null,
      end_location: `${sample.latitude.toFixed(5)}, ${sample.longitude.toFixed(5)}`,
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
  }

  const idleSince = Date.now() - (updatedState.lastMovingAt ?? Date.now())
  if (idleSince > IDLE_THRESHOLD_MS) {
    await endTrip(state.activeTripId, updatedState, sample)
  } else {
    await setAutoTripState(updatedState)
  }
}
