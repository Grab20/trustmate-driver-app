import AsyncStorage from '@react-native-async-storage/async-storage'

const CONTEXT_KEY = 'auto-trip-context'
const STATE_KEY = 'auto-trip-state'

export type AutoTripContext = {
  driverId: string
  carId: string
  applicationId: string
}

export type AutoTripPoint = { latitude: number; longitude: number }

export type AutoTripState = {
  activeTripId: string | null
  startedAt: number | null
  lastMovingAt: number | null
  distanceKm: number
  maxSpeedKmh: number
  lastPoint: AutoTripPoint | null
  consecutiveMovingSamples: number
  lastSpeedKmh: number | null
  crashPendingAt: number | null
  crashCandidateCount: number
}

const EMPTY_STATE: AutoTripState = {
  activeTripId: null,
  startedAt: null,
  lastMovingAt: null,
  distanceKm: 0,
  maxSpeedKmh: 0,
  lastPoint: null,
  consecutiveMovingSamples: 0,
  lastSpeedKmh: null,
  crashPendingAt: null,
  crashCandidateCount: 0,
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
  return raw ? JSON.parse(raw) : EMPTY_STATE
}

export async function setAutoTripState(state: AutoTripState): Promise<void> {
  await AsyncStorage.setItem(STATE_KEY, JSON.stringify(state))
}

export async function clearAutoTripState(): Promise<void> {
  await AsyncStorage.setItem(STATE_KEY, JSON.stringify(EMPTY_STATE))
}
