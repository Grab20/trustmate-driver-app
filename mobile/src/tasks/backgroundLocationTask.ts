import * as TaskManager from 'expo-task-manager'
import type * as Location from 'expo-location'
import { processLocationSample } from '../lib/autoTripEngine'

export const BACKGROUND_LOCATION_TASK = 'trustmate-background-location'

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.warn('Background location task error:', error.message)
    return
  }

  // The OS is expected to deliver these oldest-first, but a post-Doze backlog flush
  // is exactly the scenario where that guarantee is least trustworthy — sort
  // defensively so autoTripEngine's gap/ordering checks see a real timeline.
  const { locations } = data as { locations: Location.LocationObject[] }
  const orderedLocations = [...locations].sort((a, b) => a.timestamp - b.timestamp)
  for (const location of orderedLocations) {
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
