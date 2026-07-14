import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Tables } from '../types/database'

export function useTrip(tripId: string | undefined) {
  return useQuery({
    queryKey: ['trip', tripId],
    queryFn: async (): Promise<Tables<'vehicle_trips'> | null> => {
      const { data, error } = await supabase.from('vehicle_trips').select('*').eq('id', tripId as string).maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!tripId,
  })
}
