import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import type { Tables } from '../types/database'

export function useMyProfile() {
  const userId = useAuthStore((s) => s.session?.user.id)

  return useQuery({
    queryKey: ['my-profile', userId],
    queryFn: async (): Promise<Tables<'profiles'> | null> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId as string)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}
