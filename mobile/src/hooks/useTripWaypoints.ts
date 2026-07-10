import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Tables } from '../types/database'

export function useTripWaypoints(tripId: string | undefined) {
  return useQuery({
    queryKey: ['trip-waypoints', tripId],
    queryFn: async (): Promise<Tables<'trip_waypoints'>[]> => {
      const { data, error } = await supabase
        .from('trip_waypoints')
        .select('*')
        .eq('trip_id', tripId as string)
        .order('recorded_at', { ascending: true })

      if (error) throw error
      return data
    },
    enabled: !!tripId,
    refetchInterval: tripId ? 10000 : false,
  })
}
