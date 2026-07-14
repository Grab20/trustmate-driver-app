import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Tables } from '../types/database'

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async (): Promise<Tables<'profiles'> | null> => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId as string).maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}
