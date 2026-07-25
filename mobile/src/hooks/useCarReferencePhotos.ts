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
    // Damage analysis runs fire-and-forget after each upload, so poll briefly
    // to pick up each shot's result as it lands rather than requiring a
    // manual refresh — same pattern used for weekly inspection polling.
    refetchInterval: (query) => {
      const rows = query.state.data ?? []
      const stillAnalyzing = rows.some((row) => !row.analyzed_at)
      return stillAnalyzing ? 5000 : false
    },
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
            // Re-uploading a shot invalidates any previous damage analysis for
            // it — clear it here so a stale report can't outlive its photo,
            // then let the fire-and-forget call below refresh it.
            damage: [],
            analyzed_at: null,
            analysis_error: null,
          },
          { onConflict: 'car_id,shot_key' },
        )
        if (error) throw error

        // Fire-and-forget: the condition report fills in as each shot finishes
        // analyzing, so a slow/failed check never blocks the upload itself.
        supabase.functions.invoke('analyze-reference-photo', { body: { carId: input.carId, shotKey } }).catch(() => {})
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['car-reference-photos', variables.carId] })
      // The uploaded photo overwrites the same storage path (upsert), so the
      // cached signed URL for that path is now pointing at stale bytes — bust
      // it so the next render signs a fresh URL and the Image component
      // actually re-fetches instead of showing the old cached photo.
      queryClient.invalidateQueries({ queryKey: ['signed-photo-url', 'car-reference-photos'] })
    },
  })
}
