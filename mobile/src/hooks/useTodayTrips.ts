import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import type { Tables } from '../types/database'

function startOfTodayIso(): string {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  return start.toISOString()
}

export function useTodayTrips() {
  const userId = useAuthStore((s) => s.session?.user.id)

  return useQuery({
    queryKey: ['today-trips', userId],
    queryFn: async (): Promise<Tables<'vehicle_trips'>[]> => {
      const { data, error } = await supabase
        .from('vehicle_trips')
        .select('*')
        .eq('driver_id', userId as string)
        .eq('status', 'completed')
        .gte('started_at', startOfTodayIso())
        .order('started_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!userId,
    refetchInterval: 30000,
  })
}
