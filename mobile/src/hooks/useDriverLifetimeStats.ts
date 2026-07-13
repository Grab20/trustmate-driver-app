import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export type DriverLifetimeStats = {
  totalTrips: number
  totalDistanceKm: number
  topSpeedKmh: number
}

export function useDriverLifetimeStats(driverId: string | undefined) {
  return useQuery({
    queryKey: ['driver-lifetime-stats', driverId],
    queryFn: async (): Promise<DriverLifetimeStats> => {
      const { data, error } = await supabase
        .from('vehicle_trips')
        .select('distance_km, max_speed_kmh')
        .eq('driver_id', driverId as string)
        .eq('status', 'completed')

      if (error) throw error

      return data.reduce(
        (totals, trip) => ({
          totalTrips: totals.totalTrips + 1,
          totalDistanceKm: totals.totalDistanceKm + (trip.distance_km ?? 0),
          topSpeedKmh: Math.max(totals.topSpeedKmh, trip.max_speed_kmh ?? 0),
        }),
        { totalTrips: 0, totalDistanceKm: 0, topSpeedKmh: 0 },
      )
    },
    enabled: !!driverId,
    refetchInterval: 30000,
  })
}
