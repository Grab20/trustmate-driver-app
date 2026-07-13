import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import type { Tables } from '../types/database'

export function useMyTrafficOffences() {
  const userId = useAuthStore((s) => s.session?.user.id)

  return useQuery({
    queryKey: ['my-traffic-offences', userId],
    queryFn: async (): Promise<Tables<'traffic_offences'>[]> => {
      const { data, error } = await supabase
        .from('traffic_offences')
        .select('*')
        .eq('driver_id', userId as string)
        .order('offence_date', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}

export function useDriverTrafficOffencesForOwner(driverId: string | undefined) {
  return useQuery({
    queryKey: ['driver-traffic-offences-for-owner', driverId],
    queryFn: async (): Promise<Tables<'traffic_offences'>[]> => {
      const { data, error } = await supabase
        .from('traffic_offences')
        .select('*')
        .eq('driver_id', driverId as string)
        .order('offence_date', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!driverId,
  })
}
