import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import type { Tables } from '../types/database'

export function useActiveTrip() {
  const userId = useAuthStore((s) => s.session?.user.id)

  return useQuery({
    queryKey: ['active-trip', userId],
    queryFn: async (): Promise<Tables<'vehicle_trips'> | null> => {
      const { data, error } = await supabase
        .from('vehicle_trips')
        .select('*')
        .eq('driver_id', userId as string)
        .eq('status', 'active')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}
