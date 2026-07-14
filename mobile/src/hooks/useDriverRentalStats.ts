import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

export type DriverRentalStats = { previousOwnersCount: number }

export function useDriverRentalStats() {
  const userId = useAuthStore((s) => s.session?.user.id)

  return useQuery({
    queryKey: ['driver-rental-stats', userId],
    queryFn: async (): Promise<DriverRentalStats> => {
      const { data, error } = await supabase
        .from('applications')
        .select('owner_id')
        .eq('driver_id', userId as string)
        .not('matched_at', 'is', null)

      if (error) throw error

      const uniqueOwners = new Set(data.map((row) => row.owner_id).filter(Boolean))
      return { previousOwnersCount: uniqueOwners.size }
    },
    enabled: !!userId,
  })
}
