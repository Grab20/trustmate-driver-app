import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
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

export type DriverDistanceBreakdown = DistanceTotals & {
  driverId: string
  driverName: string
}

export type OwnerFleetDistanceTotals = DistanceTotals & {
  perDriver: DriverDistanceBreakdown[]
}

function emptyTotals(): DistanceTotals {
  return { today: 0, week: 0, month: 0, durationTodaySeconds: 0, durationWeekSeconds: 0 }
}

export function useOwnerFleetDistanceTotals() {
  const ownerId = useAuthStore((s) => s.session?.user.id)

  return useQuery({
    queryKey: ['owner-fleet-distance-totals', ownerId],
    queryFn: async (): Promise<OwnerFleetDistanceTotals> => {
      const { data: applications, error: applicationsError } = await supabase
        .from('applications')
        .select('driver_id, driver:profiles!applications_driver_id_fkey(id, full_name)')
        .eq('owner_id', ownerId as string)
        .eq('status', 'approved')
        .is('unmatched_at', null)

      if (applicationsError) throw applicationsError

      const driverIds = (applications ?? [])
        .map((a) => a.driver_id)
        .filter((id): id is string => !!id)

      if (driverIds.length === 0) {
        return { ...emptyTotals(), perDriver: [] }
      }

      const nameByDriverId = new Map(
        (applications ?? [])
          .filter((a): a is typeof a & { driver_id: string } => !!a.driver_id)
          .map((a) => [a.driver_id, a.driver?.full_name ?? 'Driver']),
      )

      const { data: trips, error: tripsError } = await supabase
        .from('vehicle_trips')
        .select('driver_id, distance_km, duration_seconds, started_at')
        .in('driver_id', driverIds)
        .eq('status', 'completed')
        .gte('started_at', startOfMonthIso())

      if (tripsError) throw tripsError

      const todayStart = startOfTodayIso()
      const weekStart = startOfWeekIso()

      const totals = emptyTotals()
      const perDriverTotals = new Map<string, DistanceTotals>(driverIds.map((id) => [id, emptyTotals()]))

      for (const trip of trips) {
        const km = trip.distance_km ?? 0
        const durationSeconds = trip.duration_seconds ?? 0
        const driverTotals = trip.driver_id ? perDriverTotals.get(trip.driver_id) : undefined

        totals.month += km
        if (driverTotals) driverTotals.month += km
        if (trip.started_at >= weekStart) {
          totals.week += km
          totals.durationWeekSeconds += durationSeconds
          if (driverTotals) {
            driverTotals.week += km
            driverTotals.durationWeekSeconds += durationSeconds
          }
        }
        if (trip.started_at >= todayStart) {
          totals.today += km
          totals.durationTodaySeconds += durationSeconds
          if (driverTotals) {
            driverTotals.today += km
            driverTotals.durationTodaySeconds += durationSeconds
          }
        }
      }

      return {
        ...totals,
        perDriver: driverIds.map((driverId) => ({
          driverId,
          driverName: nameByDriverId.get(driverId) ?? 'Driver',
          ...(perDriverTotals.get(driverId) ?? emptyTotals()),
        })),
      }
    },
    enabled: !!ownerId,
    refetchInterval: 30000,
  })
}
