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
          // Balanced accuracy (~100m) can fall back to network/cell-tower positioning
          // instead of the GPS chip, which frequently omits real speed data — exactly
          // what distance and top speed depend on. BestForNavigation forces GPS-grade
          // fixes with that data included.
          accuracy: Location.Accuracy.BestForNavigation,
          // A sample every 30s / 30m is too sparse to follow a curved road accurately —
          // 5s / 15m is still light on battery but frequent enough for the start/stop
          // state machine (autoTripEngine.ts) to resolve distance and duration precisely.
          timeInterval: 5000,
          distanceInterval: 15,
          pausesUpdatesAutomatically: false,
          activityType: Location.ActivityType.AutomotiveNavigation,
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

  // This hook is only mounted from the driver tab layout, so tearing down here
  // means the signed-in user has navigated out of the driver section entirely
  // (signed out, or — for a dual driver+owner account — switched to Owner
  // view). Without this, a dual-role account's background tracking kept
  // running while they browsed as the owner, attributing that movement to
  // the driver profile: the app should only ever track the driver, not
  // whoever happens to be holding the phone. Deliberately a separate effect
  // with an empty dependency array — it must fire only on true unmount, not
  // on every rental-detail change the sync effect above already handles.
  useEffect(() => {
    return () => {
      Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK)
        .then((isRegistered) => (isRegistered ? Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK) : undefined))
        .catch(() => {})
      setAutoTripContext(null)
    }
  }, [])

  return status
}
