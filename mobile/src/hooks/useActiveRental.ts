import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import type { Tables } from '../types/database'

export type ActiveRental = Tables<'applications'> & {
  cars: Tables<'cars'> | null
}

async function fetchActiveRental(driverId: string): Promise<ActiveRental | null> {
  const { data, error } = await supabase
    .from('applications')
    .select('*, cars(*)')
    .eq('driver_id', driverId)
    .eq('status', 'approved')
    .is('unmatched_at', null)
    .maybeSingle()

  if (error) throw error
  return data as ActiveRental | null
}

export function useActiveRental() {
  const userId = useAuthStore((s) => s.session?.user.id)

  return useQuery({
    queryKey: ['active-rental', userId],
    queryFn: () => fetchActiveRental(userId as string),
    enabled: !!userId,
  })
}
