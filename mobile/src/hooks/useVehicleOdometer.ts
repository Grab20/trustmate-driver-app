import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useVehicleOdometer(carId: string | undefined) {
  return useQuery({
    queryKey: ['vehicle-odometer', carId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicle_odometers')
        .select('*')
        .eq('car_id', carId as string)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!carId,
  })
}
