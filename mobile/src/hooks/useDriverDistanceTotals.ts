import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { DistanceTotals } from './useDistanceTotals'

function startOfTodayIso(): string {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  return start.toISOString()
}

function startOfWeekIso(): string {
  const now = new Date()
  const diffToMonday = (now.getDay() + 6) % 7
  const monday = new Date(now)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(now.getDate() - diffToMonday)
  return monday.toISOString()
}

function startOfMonthIso(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

export function useDriverDistanceTotals(driverId: string | undefined) {
  return useQuery({
    queryKey: ['driver-distance-totals', driverId],
    queryFn: async (): Promise<DistanceTotals> => {
      // Includes the currently in-progress trip (if any) — see useDistanceTotals,
      // which this mirrors for the owner viewing a specific driver. Without this,
      // the owner's totals would lag the driver's own screen until each trip ends.
      const { data, error } = await supabase
        .from('vehicle_trips')
        .select('distance_km, duration_seconds, started_at')
        .eq('driver_id', driverId as string)
        .in('status', ['completed', 'active'])
        .gte('started_at', startOfMonthIso())

      if (error) throw error

      const todayStart = startOfTodayIso()
      const weekStart = startOfWeekIso()

      return data.reduce(
        (totals, trip) => {
          const km = trip.distance_km ?? 0
          const durationSeconds = trip.duration_seconds ?? 0
          totals.month += km
          if (trip.started_at >= weekStart) totals.week += km
          if (trip.started_at >= todayStart) totals.today += km
          if (trip.started_at >= weekStart) totals.durationWeekSeconds += durationSeconds
          if (trip.started_at >= todayStart) totals.durationTodaySeconds += durationSeconds
          return totals
        },
        { today: 0, week: 0, month: 0, durationTodaySeconds: 0, durationWeekSeconds: 0 } as DistanceTotals,
      )
    },
    enabled: !!driverId,
    refetchInterval: 30000,
  })
}
