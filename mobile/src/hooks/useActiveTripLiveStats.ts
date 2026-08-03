import { useEffect, useState } from 'react'
import { getAutoTripState } from '../lib/autoTripStorage'

export type ActiveTripLiveStats = {
  distanceKm: number
  elapsedSeconds: number
  maxSpeedKmh: number
}

// Matches the background task's own sample interval (useAutoTripTracking) — no
// point polling AsyncStorage faster than the state it reads actually changes.
const POLL_INTERVAL_MS = 5000

// The running trip lives in AsyncStorage, written by the background location
// task (autoTripEngine), not through React state — this hook is the bridge
// that lets the UI show live progress on a trip already in flight.
export function useActiveTripLiveStats(): ActiveTripLiveStats | null {
  const [stats, setStats] = useState<ActiveTripLiveStats | null>(null)

  useEffect(() => {
    let cancelled = false

    async function refresh() {
      const state = await getAutoTripState()
      if (cancelled) return
      if (!state.activeTripId || state.startedAt == null) {
        setStats(null)
        return
      }
      setStats({
        distanceKm: state.distanceKm,
        elapsedSeconds: Math.max(0, Math.round((Date.now() - state.startedAt) / 1000)),
        maxSpeedKmh: state.maxSpeedKmh,
      })
    }

    refresh()
    const interval = setInterval(refresh, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return stats
}
