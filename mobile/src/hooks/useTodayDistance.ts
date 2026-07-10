import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

function startOfTodayIso(): string {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  return start.toISOString()
}

export function useTodayDistance() {
  const userId = useAuthStore((s) => s.session?.user.id)

  return useQuery({
    queryKey: ['today-distance', userId],
    queryFn: async (): Promise<number> => {
      const { data, error } = await supabase
        .from('vehicle_trips')
        .select('distance_km')
        .eq('driver_id', userId as string)
        .eq('status', 'completed')
        .gte('started_at', startOfTodayIso())

      if (error) throw error
      return data.reduce((total, trip) => total + (trip.distance_km ?? 0), 0)
    },
    enabled: !!userId,
    refetchInterval: 30000,
  })
}
