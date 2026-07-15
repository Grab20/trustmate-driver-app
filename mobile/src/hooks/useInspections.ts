import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { uploadInspectionPhoto } from '../lib/uploadInspectionPhoto'
import { useAuthStore } from '../stores/authStore'
import type { Tables } from '../types/database'

export function useInspectionHistory() {
  const userId = useAuthStore((s) => s.session?.user.id)

  return useQuery({
    queryKey: ['inspections', userId],
    queryFn: async (): Promise<Tables<'vehicle_inspections'>[]> => {
      const { data, error } = await supabase
        .from('vehicle_inspections')
        .select('*')
        .eq('driver_id', userId as string)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!userId,
    refetchInterval: 15000,
  })
}

type SubmitInspectionInput = {
  carId: string
  applicationId: string
  odometerKm: number | null
  notes: string
  photoUris: string[]
  inspectionType?: 'weekly_checkin' | 'proof_of_payment' | 'incident_report'
}

export function useSubmitInspection() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.session?.user.id)

  return useMutation({
    mutationFn: async (input: SubmitInspectionInput) => {
      const driverId = userId as string

      const { data: inspection, error: insertError } = await supabase
        .from('vehicle_inspections')
        .insert({
          driver_id: driverId,
          car_id: input.carId,
          application_id: input.applicationId,
          inspection_type: input.inspectionType ?? 'weekly_checkin',
          odometer_km: input.odometerKm,
          notes: input.notes || null,
        })
        .select()
        .single()

      if (insertError) throw insertError

      const photoPaths: string[] = []
      for (let i = 0; i < input.photoUris.length; i++) {
        const path = await uploadInspectionPhoto(driverId, inspection.id, input.photoUris[i], i)
        photoPaths.push(path)
      }

      if (photoPaths.length > 0) {
        const { error: updateError } = await supabase
          .from('vehicle_inspections')
          .update({ photo_urls: photoPaths })
          .eq('id', inspection.id)

        if (updateError) throw updateError
      }

      if ((input.inspectionType ?? 'weekly_checkin') === 'weekly_checkin') {
        // Fire-and-forget: AI review runs in the background and the inspection
        // lists poll for the result, so a slow/failed analysis never blocks submission.
        supabase.functions.invoke('analyze-inspection', { body: { inspectionId: inspection.id } }).catch(() => {})
      }

      return inspection
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections', userId] })
    },
  })
}

export function useDriverInspectionsForOwner(driverId: string | undefined) {
  return useQuery({
    queryKey: ['driver-inspections-for-owner', driverId],
    queryFn: async (): Promise<Tables<'vehicle_inspections'>[]> => {
      const { data, error } = await supabase
        .from('vehicle_inspections')
        .select('*')
        .eq('driver_id', driverId as string)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!driverId,
    refetchInterval: 15000,
  })
}

type ReviewInspectionInput = {
  inspectionId: string
  status: 'approved' | 'declined'
  comment: string
}

export function useReviewInspection(driverId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ReviewInspectionInput) => {
      const { error } = await supabase
        .from('vehicle_inspections')
        .update({
          owner_review_status: input.status,
          owner_review_comment: input.comment || null,
          owner_reviewed_at: new Date().toISOString(),
        })
        .eq('id', input.inspectionId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-inspections-for-owner', driverId] })
    },
  })
}
