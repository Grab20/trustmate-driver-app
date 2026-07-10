import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import type { Tables } from '../types/database'

export function useDriverProfile() {
  const userId = useAuthStore((s) => s.session?.user.id)

  return useQuery({
    queryKey: ['driver-profile', userId],
    queryFn: async (): Promise<Tables<'driver_profiles'> | null> => {
      const { data, error } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('user_id', userId as string)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}
