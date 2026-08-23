import AsyncStorage from '@react-native-async-storage/async-storage'

const CONTEXT_KEY = 'auto-trip-context'
const STATE_KEY = 'auto-trip-state'

export type AutoTripContext = {
  driverId: string
  carId: string
  applicationId: string
}

export type AutoTripPoint = { latitude: number; longitude: number }

// See tripDetectionConfig.ts for the thresholds that drive these transitions.
//   idle            no trip, no candidate in progress
//   start_candidate movement at/above the start speed, accumulating duration
//                   + distance; confirms into 'active', or falls back to
//                   'idle' if speed drops before both are satisfied
//   active          a vehicle_trips row exists and is being updated
//   stop_candidate  an active trip whose vehicle looks stopped; accumulating
//                   stationary duration; resumes 'active' if real movement
//                   is seen again, or ends the trip once the stop threshold
//                   is reached
export type TripPhase = 'idle' | 'start_candidate' | 'active' | 'stop_candidate'

export type AutoTripState = {
  phase: TripPhase
  activeTripId: string | null
  startedAt: number | null
  lastMovingAt: number | null
  // The GPS fix timestamp (not processing wall-clock time) of the last sample
  // seen, moving or not — needed to compute correct elapsed time between
  // samples when Android delivers a batch of queued locations all at once
  // after a background/Doze gap, which would otherwise make Date.now() look
  // like every location in the batch happened simultaneously.
  lastSampleAt: number | null
  distanceKm: number
  maxSpeedKmh: number
  lastPoint: AutoTripPoint | null
  lastSpeedMs: number | null
  // Total elapsed time (seconds) across samples classified as "moving" —
  // duration_seconds minus this gives idle time spent stopped *within* the
  // trip (traffic lights, waiting), without counting the trailing
  // stop-confirmation window used only to decide the trip had ended.
  movingSeconds: number

  // start_candidate bookkeeping — cleared whenever phase leaves start_candidate.
  startCandidateSince: number | null
  startCandidateAnchor: AutoTripPoint | null
  startCandidateDistanceM: number

  // stop_candidate bookkeeping — cleared whenever phase leaves stop_candidate.
  stopCandidateSince: number | null
  stopCandidateAnchor: AutoTripPoint | null

  // Throttling so a database write doesn't happen on every raw GPS fix.
  lastWaypointAt: number | null
  lastWaypointPoint: AutoTripPoint | null
  lastProgressUpdateAt: number | null
}

const EMPTY_STATE: AutoTripState = {
  phase: 'idle',
  activeTripId: null,
  startedAt: null,
  lastMovingAt: null,
  lastSampleAt: null,
  distanceKm: 0,
  maxSpeedKmh: 0,
  lastPoint: null,
  lastSpeedMs: null,
  movingSeconds: 0,
  startCandidateSince: null,
  startCandidateAnchor: null,
  startCandidateDistanceM: 0,
  stopCandidateSince: null,
  stopCandidateAnchor: null,
  lastWaypointAt: null,
  lastWaypointPoint: null,
  lastProgressUpdateAt: null,
}

export async function getAutoTripContext(): Promise<AutoTripContext | null> {
  const raw = await AsyncStorage.getItem(CONTEXT_KEY)
  return raw ? JSON.parse(raw) : null
}

export async function setAutoTripContext(context: AutoTripContext | null): Promise<void> {
  if (context) {
    await AsyncStorage.setItem(CONTEXT_KEY, JSON.stringify(context))
  } else {
    await AsyncStorage.removeItem(CONTEXT_KEY)
  }
}

export async function getAutoTripState(): Promise<AutoTripState> {
  const raw = await AsyncStorage.getItem(STATE_KEY)
  // Merged over EMPTY_STATE so a state persisted by an older build (before a
  // field existed) doesn't come back missing keys the current engine expects.
  return raw ? { ...EMPTY_STATE, ...JSON.parse(raw) } : EMPTY_STATE
}

export async function setAutoTripState(state: AutoTripState): Promise<void> {
  await AsyncStorage.setItem(STATE_KEY, JSON.stringify(state))
}

export async function clearAutoTripState(): Promise<void> {
  await AsyncStorage.setItem(STATE_KEY, JSON.stringify(EMPTY_STATE))
}
