import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import type { Tables } from '../types/database'

// All of an owner's cars, independent of whether a driver has been matched
// yet — the fleet summary (drivers list) only includes cars with an approved
// application, which left "Manage Reference Photos" completely unreachable
// for a car that hasn't been matched to a driver yet, even though reference
// photos are meant to be taken before handing the car over.
export function useOwnerCars() {
  const userId = useAuthStore((s) => s.session?.user.id)

  return useQuery({
    queryKey: ['owner-cars', userId],
    queryFn: async (): Promise<Tables<'cars'>[]> => {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('owner_id', userId as string)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}
