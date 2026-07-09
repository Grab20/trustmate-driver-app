import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

type StartTripInput = {
  carId: string
  applicationId: string
  odometerStartKm: number
  startLocation: string | null
}

export function useStartTrip() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.session?.user.id)

  return useMutation({
    mutationFn: async (input: StartTripInput) => {
      const { data, error } = await supabase
        .from('vehicle_trips')
        .insert({
          driver_id: userId as string,
          car_id: input.carId,
          application_id: input.applicationId,
          odometer_start_km: input.odometerStartKm,
          start_location: input.startLocation,
          status: 'active',
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-trip', userId] })
    },
  })
}

type EndTripInput = {
  tripId: string
  carId: string
  durationSeconds: number
  distanceKm: number
  avgSpeedKmh: number | null
  maxSpeedKmh: number | null
  odometerEndKm: number
  endLocation: string | null
}

export function useEndTrip() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.session?.user.id)

  return useMutation({
    mutationFn: async (input: EndTripInput) => {
      const { error: tripError } = await supabase
        .from('vehicle_trips')
        .update({
          ended_at: new Date().toISOString(),
          duration_seconds: Math.round(input.durationSeconds),
          distance_km: input.distanceKm,
          avg_speed_kmh: input.avgSpeedKmh,
          max_speed_kmh: input.maxSpeedKmh,
          odometer_end_km: input.odometerEndKm,
          end_location: input.endLocation,
          status: 'completed',
        })
        .eq('id', input.tripId)

      if (tripError) throw tripError

      const { error: odoError } = await supabase.from('vehicle_odometers').upsert({
        car_id: input.carId,
        current_km: input.odometerEndKm,
        last_updated: new Date().toISOString(),
      })

      if (odoError) throw odoError
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['active-trip', userId] })
      queryClient.invalidateQueries({ queryKey: ['vehicle-odometer', variables.carId] })
    },
  })
}
