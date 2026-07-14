import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Tables } from '../types/database'

export function useDriverProfileForOwner(driverId: string | undefined) {
  return useQuery({
    queryKey: ['driver-profile-for-owner', driverId],
    queryFn: async (): Promise<Tables<'driver_profiles'> | null> => {
      const { data, error } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('user_id', driverId as string)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!driverId,
  })
}
