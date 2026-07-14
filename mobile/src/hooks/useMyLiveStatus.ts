import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import type { Tables } from '../types/database'

export function useMyLiveStatus() {
  const userId = useAuthStore((s) => s.session?.user.id)

  return useQuery({
    queryKey: ['my-live-status', userId],
    queryFn: async (): Promise<Tables<'driver_live_status'> | null> => {
      const { data, error } = await supabase
        .from('driver_live_status')
        .select('*')
        .eq('driver_id', userId as string)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!userId,
    refetchInterval: 15000,
  })
}
