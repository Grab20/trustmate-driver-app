import { useCallback, useEffect, useRef, useState } from 'react'
import * as Location from 'expo-location'
import { supabase } from '../lib/supabase'
import { haversineDistanceKm } from '../utils/geo'

export type TripPoint = { latitude: number; longitude: number }

const SAMPLE_INTERVAL_MS = 15000
const SAMPLE_DISTANCE_M = 50

export function useTripLocationTracking(tripId: string | null) {
  const [waypoints, setWaypoints] = useState<TripPoint[]>([])
  const [distanceKm, setDistanceKm] = useState(0)
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState(0)
  const [maxSpeedKmh, setMaxSpeedKmh] = useState(0)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const lastPointRef = useRef<TripPoint | null>(null)
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null)

  useEffect(() => {
    if (!tripId) return
    const currentTripId = tripId

    let cancelled = false

    async function start() {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        if (!cancelled) setPermissionDenied(true)
        return
      }

      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: SAMPLE_INTERVAL_MS,
          distanceInterval: SAMPLE_DISTANCE_M,
        },
        (location) => {
          const point = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }
          const speedMs = location.coords.speed ?? 0
          const speedKmh = speedMs > 0 ? speedMs * 3.6 : 0

          setWaypoints((prev) => [...prev, point])
          setCurrentSpeedKmh(speedKmh)
          setMaxSpeedKmh((prev) => Math.max(prev, speedKmh))

          if (lastPointRef.current) {
            const segmentKm = haversineDistanceKm(
              lastPointRef.current.latitude,
              lastPointRef.current.longitude,
              point.latitude,
              point.longitude,
            )
            setDistanceKm((prev) => prev + segmentKm)
          }
          lastPointRef.current = point

          supabase
            .from('trip_waypoints')
            .insert({
              trip_id: currentTripId,
              lat: point.latitude,
              lng: point.longitude,
              speed_kmh: speedKmh,
              accuracy_m: location.coords.accuracy ?? null,
            })
            .then(({ error }) => {
              if (error) console.warn('Failed to save waypoint:', error.message)
            })
        },
      )
    }

    start()

    return () => {
      cancelled = true
      subscriptionRef.current?.remove()
      subscriptionRef.current = null
    }
  }, [tripId])

  const reset = useCallback(() => {
    setWaypoints([])
    setDistanceKm(0)
    setCurrentSpeedKmh(0)
    setMaxSpeedKmh(0)
    setPermissionDenied(false)
    lastPointRef.current = null
  }, [])

  return { waypoints, distanceKm, currentSpeedKmh, maxSpeedKmh, permissionDenied, reset }
}
