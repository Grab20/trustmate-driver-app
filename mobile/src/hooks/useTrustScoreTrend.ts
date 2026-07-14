import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

function startOfMonthIso(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

export function useTrustScoreTrend() {
  const userId = useAuthStore((s) => s.session?.user.id)

  return useQuery({
    queryKey: ['trust-score-trend', userId],
    queryFn: async (): Promise<number> => {
      const { data, error } = await supabase
        .from('trust_actions')
        .select('points')
        .eq('driver_id', userId as string)
        .gte('created_at', startOfMonthIso())

      if (error) throw error
      return data.reduce((sum, action) => sum + (action.points ?? 0), 0)
    },
    enabled: !!userId,
  })
}
