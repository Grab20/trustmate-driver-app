import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export type TripMetrics = {
  totalTrips: number
  totalDistanceKm: number
  totalDurationSeconds: number
  idleSeconds: number
  avgSpeedKmh: number | null
  maxSpeedKmh: number | null
  nightTrips: number
  weekendTrips: number
}

export type DrivingSafetySummary = {
  tripMetrics: TripMetrics
}

// Rental weeks run Monday-Sunday (matches useDistanceTotals' convention).
function startOfWeekIso(weeksAgo: number): string {
  const now = new Date()
  const diffToMonday = (now.getDay() + 6) % 7
  const monday = new Date(now)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(now.getDate() - diffToMonday - weeksAgo * 7)
  return monday.toISOString()
}

// Night driving is judged against the device's own local time, same as every
// other trip timestamp shown in this app — there's no per-driver timezone
// stored to convert against instead.
const NIGHT_HOUR_START = 20
const NIGHT_HOUR_END = 6

function isNightStart(iso: string): boolean {
  const hour = new Date(iso).getHours()
  return hour >= NIGHT_HOUR_START || hour < NIGHT_HOUR_END
}

function isWeekendStart(iso: string): boolean {
  const day = new Date(iso).getDay()
  return day === 0 || day === 6
}

function computeTripMetrics(trips: { distance_km: number | null; duration_seconds: number | null; idle_seconds: number | null; avg_speed_kmh: number | null; max_speed_kmh: number | null; started_at: string }[]): TripMetrics {
  let totalDistanceKm = 0
  let totalDurationSeconds = 0
  let idleSeconds = 0
  let maxSpeedKmh: number | null = null
  let nightTrips = 0
  let weekendTrips = 0

  for (const trip of trips) {
    totalDistanceKm += trip.distance_km ?? 0
    totalDurationSeconds += trip.duration_seconds ?? 0
    idleSeconds += trip.idle_seconds ?? 0
    if (trip.max_speed_kmh != null) maxSpeedKmh = Math.max(maxSpeedKmh ?? 0, trip.max_speed_kmh)
    if (isNightStart(trip.started_at)) nightTrips++
    if (isWeekendStart(trip.started_at)) weekendTrips++
  }

  const avgSpeedKmh = totalDurationSeconds > 0 ? totalDistanceKm / (totalDurationSeconds / 3600) : null

  return {
    totalTrips: trips.length,
    totalDistanceKm,
    totalDurationSeconds,
    idleSeconds,
    avgSpeedKmh,
    maxSpeedKmh,
    nightTrips,
    weekendTrips,
  }
}

const EMPTY_TRIP_METRICS: TripMetrics = {
  totalTrips: 0,
  totalDistanceKm: 0,
  totalDurationSeconds: 0,
  idleSeconds: 0,
  avgSpeedKmh: null,
  maxSpeedKmh: null,
  nightTrips: 0,
  weekendTrips: 0,
}

export function useDrivingSafetySummary(driverId: string | undefined) {
  return useQuery({
    queryKey: ['driving-safety-summary', driverId],
    queryFn: async (): Promise<DrivingSafetySummary> => {
      const thisWeekStart = startOfWeekIso(0)

      const tripsResult = await supabase
        .from('vehicle_trips')
        .select('distance_km, duration_seconds, idle_seconds, avg_speed_kmh, max_speed_kmh, started_at')
        .eq('driver_id', driverId as string)
        .eq('status', 'completed')
        .gte('started_at', thisWeekStart)

      if (tripsResult.error) throw tripsResult.error

      const tripMetrics = tripsResult.data.length > 0 ? computeTripMetrics(tripsResult.data) : EMPTY_TRIP_METRICS

      return { tripMetrics }
    },
    enabled: !!driverId,
    refetchInterval: 60000,
  })
}
