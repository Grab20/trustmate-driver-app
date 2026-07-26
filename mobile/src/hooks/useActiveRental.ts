import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import type { Tables } from '../types/database'

export type ActiveRental = Tables<'applications'> & {
  cars: Tables<'cars'> | null
  owner: Pick<Tables<'profiles'>, 'id' | 'full_name' | 'phone' | 'whatsapp'> | null
}

async function fetchActiveRental(driverId: string): Promise<ActiveRental | null> {
  const { data, error } = await supabase
    .from('applications')
    .select('*, cars(*), owner:profiles!applications_owner_id_fkey(id, full_name, phone, whatsapp)')
    .eq('driver_id', driverId)
    .eq('status', 'approved')
    .is('unmatched_at', null)
    // A match approved on the website without a car attached (car_id null)
    // isn't a usable rental — excluding it here means the driver correctly
    // sees "No Active Rental Yet" instead of a car-less rental that silently
    // can't upload photos or submit anything.
    .not('car_id', 'is', null)
    .order('matched_at', { ascending: false })
    .limit(1)
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
