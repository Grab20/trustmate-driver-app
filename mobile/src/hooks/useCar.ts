import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Tables } from '../types/database'

export function useCar(carId: string | undefined) {
  return useQuery({
    queryKey: ['car', carId],
    queryFn: async (): Promise<Tables<'cars'> | null> => {
      const { data, error } = await supabase.from('cars').select('*').eq('id', carId as string).maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!carId,
  })
}

export function useUpdateNextServiceDate(carId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (nextServiceDate: string | null) => {
      const { error } = await supabase
        .from('cars')
        .update({ next_service_date: nextServiceDate })
        .eq('id', carId as string)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['car', carId] })
    },
  })
}
