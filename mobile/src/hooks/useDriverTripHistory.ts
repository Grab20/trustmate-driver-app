import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Tables } from '../types/database'

const HISTORY_LIMIT = 20

export function useDriverTripHistory(driverId: string | undefined) {
  return useQuery({
    queryKey: ['driver-trip-history', driverId],
    queryFn: async (): Promise<Tables<'vehicle_trips'>[]> => {
      const { data, error } = await supabase
        .from('vehicle_trips')
        .select('*')
        .eq('driver_id', driverId as string)
        .eq('status', 'completed')
        .order('started_at', { ascending: false })
        .limit(HISTORY_LIMIT)

      if (error) throw error
      return data
    },
    enabled: !!driverId,
    refetchInterval: 30000,
  })
}
