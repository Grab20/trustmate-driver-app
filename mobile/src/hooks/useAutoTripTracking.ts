import { useEffect } from 'react'
import * as Location from 'expo-location'
import { useActiveRental } from './useActiveRental'
import { useAuthStore } from '../stores/authStore'
import { setAutoTripContext } from '../lib/autoTripStorage'
import { BACKGROUND_LOCATION_TASK } from '../tasks/backgroundLocationTask'
import { useAutoTripTrackingStore, type AutoTripPermissionStatus } from '../stores/autoTripTrackingStore'

export type { AutoTripPermissionStatus }

export function useAutoTripTracking(): AutoTripPermissionStatus {
  const userId = useAuthStore((s) => s.session?.user.id)
  const { data: activeRental } = useActiveRental()
  const status = useAutoTripTrackingStore((s) => s.status)
  const setStatus = useAutoTripTrackingStore((s) => s.setStatus)

  const carId = activeRental?.car_id
  const applicationId = activeRental?.id

  useEffect(() => {
    let cancelled = false

    async function sync() {
      if (!userId || !carId || !applicationId) {
        const isRegistered = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK).catch(
          () => false,
        )
        if (isRegistered) await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK)
        await setAutoTripContext(null)
        return
      }

      await setAutoTripContext({ driverId: userId, carId, applicationId })

      const foreground = await Location.requestForegroundPermissionsAsync()
      if (foreground.status !== 'granted') {
        if (!cancelled) setStatus('denied')
        return
      }

      const background = await Location.requestBackgroundPermissionsAsync()
      if (background.status !== 'granted') {
        if (!cancelled) setStatus('denied')
        return
      }

      if (!cancelled) setStatus('granted')

      const isRegistered = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK).catch(
        () => false,
      )
      if (!isRegistered) {
        await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 30000,
          distanceInterval: 30,
          pausesUpdatesAutomatically: false,
          foregroundService: {
            notificationTitle: 'TrustMate Driver',
            notificationBody: 'Monitoring your rental for automatic trip tracking.',
          },
        })
      }
    }

    sync()

    return () => {
      cancelled = true
    }
  }, [userId, carId, applicationId])

  return status
}
