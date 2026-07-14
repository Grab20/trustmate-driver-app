import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import type { Tables } from '../types/database'

export type OwnerFleetTrip = Tables<'vehicle_trips'> & {
  driver: Pick<Tables<'profiles'>, 'id' | 'full_name'> | null
}

const FLEET_TRIPS_LIMIT = 30

export function useOwnerFleetTrips() {
  const userId = useAuthStore((s) => s.session?.user.id)

  return useQuery({
    queryKey: ['owner-fleet-trips', userId],
    queryFn: async (): Promise<OwnerFleetTrip[]> => {
      const { data, error } = await supabase
        .from('vehicle_trips')
        .select('*, driver:profiles!vehicle_trips_driver_id_fkey(id, full_name)')
        .eq('status', 'completed')
        .order('started_at', { ascending: false })
        .limit(FLEET_TRIPS_LIMIT)

      if (error) throw error
      return data as OwnerFleetTrip[]
    },
    enabled: !!userId,
    refetchInterval: 30000,
  })
}
