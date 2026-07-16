import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { uploadReferencePhoto } from '../lib/uploadReferencePhoto'
import type { Tables } from '../types/database'
import type { InspectionShotKey } from '../components/InspectionShotGuide'

export function useCarReferencePhotos(carId: string | undefined) {
  return useQuery({
    queryKey: ['car-reference-photos', carId],
    queryFn: async (): Promise<Tables<'car_reference_photos'>[]> => {
      const { data, error } = await supabase
        .from('car_reference_photos')
        .select('*')
        .eq('car_id', carId as string)

      if (error) throw error
      return data
    },
    enabled: !!carId,
  })
}

type SubmitReferencePhotosInput = {
  carId: string
  photos: Partial<Record<InspectionShotKey, string>>
}

export function useSubmitReferencePhotos() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: SubmitReferencePhotosInput) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      for (const [shotKey, uri] of Object.entries(input.photos)) {
        if (!uri) continue
        const path = await uploadReferencePhoto(input.carId, shotKey, uri)
        const { error } = await supabase.from('car_reference_photos').upsert(
          {
            car_id: input.carId,
            shot_key: shotKey,
            photo_path: path,
            uploaded_by: user?.id,
          },
          { onConflict: 'car_id,shot_key' },
        )
        if (error) throw error
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['car-reference-photos', variables.carId] })
    },
  })
}
