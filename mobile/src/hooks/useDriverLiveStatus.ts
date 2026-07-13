import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Tables } from '../types/database'

export function useDriverLiveStatus(driverId: string | undefined) {
  return useQuery({
    queryKey: ['driver-live-status', driverId],
    queryFn: async (): Promise<Tables<'driver_live_status'> | null> => {
      const { data, error } = await supabase
        .from('driver_live_status')
        .select('*')
        .eq('driver_id', driverId as string)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!driverId,
    refetchInterval: 15000,
  })
}
