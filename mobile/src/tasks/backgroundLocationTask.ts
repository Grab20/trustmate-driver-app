import * as TaskManager from 'expo-task-manager'
import type * as Location from 'expo-location'
import { processLocationSample } from '../lib/autoTripEngine'

export const BACKGROUND_LOCATION_TASK = 'trustmate-background-location'

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.warn('Background location task error:', error.message)
    return
  }

  const { locations } = data as { locations: Location.LocationObject[] }
  for (const location of locations) {
    await processLocationSample({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      speedMs: location.coords.speed,
      accuracyM: location.coords.accuracy,
      heading: location.coords.heading,
      timestamp: location.timestamp,
    })
  }
})
