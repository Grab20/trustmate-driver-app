import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import type { Tables } from '../types/database'

export type OwnerFleetEntry = Tables<'applications'> & {
  cars: Tables<'cars'> | null
  driver: Pick<Tables<'profiles'>, 'id' | 'full_name' | 'photo_url'> | null
  liveStatus: Tables<'driver_live_status'> | null
}

async function fetchOwnerFleet(ownerId: string): Promise<OwnerFleetEntry[]> {
  const { data: applications, error } = await supabase
    .from('applications')
    .select('*, cars(*), driver:profiles!applications_driver_id_fkey(id, full_name, photo_url)')
    .eq('owner_id', ownerId)
    .eq('status', 'approved')
    .is('unmatched_at', null)

  if (error) throw error
  if (!applications || applications.length === 0) return []

  const driverIds = applications.map((a) => a.driver_id).filter((id): id is string => !!id)

  const { data: liveStatuses, error: liveStatusError } = await supabase
    .from('driver_live_status')
    .select('*')
    .in('driver_id', driverIds)

  if (liveStatusError) throw liveStatusError

  const liveStatusByDriverId = new Map((liveStatuses ?? []).map((ls) => [ls.driver_id, ls]))

  return applications.map((application) => ({
    ...application,
    liveStatus: application.driver_id ? (liveStatusByDriverId.get(application.driver_id) ?? null) : null,
  })) as OwnerFleetEntry[]
}

export function useOwnerFleet() {
  const userId = useAuthStore((s) => s.session?.user.id)

  return useQuery({
    queryKey: ['owner-fleet', userId],
    queryFn: () => fetchOwnerFleet(userId as string),
    enabled: !!userId,
    refetchInterval: 20000,
  })
}
