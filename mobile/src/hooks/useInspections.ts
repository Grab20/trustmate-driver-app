import { useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { uploadInspectionPhoto } from '../lib/uploadInspectionPhoto'
import { useAuthStore } from '../stores/authStore'
import type { Tables } from '../types/database'

// A submission's fire-and-forget analyze-inspection call can fail silently
// (cold start, transient network error) and leave ai_analyzed_at null
// forever, with no owner-facing signal that anything went wrong. Retrying
// once whenever a report screen opens on an unanalyzed inspection lets it
// self-heal instead of getting stuck showing "in progress" indefinitely.
export function useRetryPendingAnalysis(
  inspection: Pick<Tables<'vehicle_inspections'>, 'id' | 'ai_analyzed_at' | 'inspection_type'> | null | undefined,
) {
  const attemptedId = useRef<string | null>(null)

  useEffect(() => {
    if (!inspection) return
    if (inspection.inspection_type !== 'weekly_checkin') return
    if (inspection.ai_analyzed_at) return
    if (attemptedId.current === inspection.id) return
    attemptedId.current = inspection.id
    supabase.functions.invoke('analyze-inspection', { body: { inspectionId: inspection.id } }).catch(() => {})
  }, [inspection])
}

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
  photoUris?: string[]
  // Already-uploaded storage paths (see uploadInspectionDraftPhoto) — used
  // instead of photoUris when the shots were uploaded immediately as they
  // were captured, rather than all at once here.
  draftPhotoPaths?: string[]
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
      if (input.draftPhotoPaths && input.draftPhotoPaths.length > 0) {
        for (let i = 0; i < input.draftPhotoPaths.length; i++) {
          const draftPath = input.draftPhotoPaths[i]
          const extensionMatch = draftPath.match(/\.(\w+)$/)
          const extension = extensionMatch ? extensionMatch[1] : 'jpg'
          const finalPath = `${driverId}/${inspection.id}/${i}.${extension}`
          const { error: copyError } = await supabase.storage.from('inspection-photos').copy(draftPath, finalPath)
          if (copyError) throw copyError
          photoPaths.push(finalPath)
        }
      } else {
        for (let i = 0; i < (input.photoUris ?? []).length; i++) {
          const path = await uploadInspectionPhoto(driverId, inspection.id, (input.photoUris as string[])[i], i)
          photoPaths.push(path)
        }
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

export function useInspectionReport(inspectionId: string | undefined) {
  return useQuery({
    queryKey: ['inspection-report', inspectionId],
    queryFn: async (): Promise<Tables<'vehicle_inspections'>> => {
      const { data, error } = await supabase
        .from('vehicle_inspections')
        .select('*')
        .eq('id', inspectionId as string)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!inspectionId,
    refetchInterval: 15000,
  })
}

export function useWeeklyInspectionsForCar(carId: string | undefined, driverId: string | undefined) {
  return useQuery({
    queryKey: ['weekly-inspections-for-car', carId, driverId],
    queryFn: async (): Promise<Tables<'vehicle_inspections'>[]> => {
      const { data, error } = await supabase
        .from('vehicle_inspections')
        .select('*')
        .eq('car_id', carId as string)
        .eq('driver_id', driverId as string)
        .eq('inspection_type', 'weekly_checkin')
        .order('created_at', { ascending: true })

      if (error) throw error
      return data
    },
    enabled: !!carId && !!driverId,
    refetchInterval: 15000,
  })
}

type ReviewInspectionInput = {
  inspectionId: string
  status: 'approved' | 'declined' | 'reinspection_requested' | 'flagged'
  comment: string
  flagReason?: 'existing_damage' | 'false_detection' | null
}

const INSPECTION_APPROVAL_TRUST_POINTS = 2

export function useReviewInspection(driverId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ReviewInspectionInput) => {
      const { error } = await supabase
        .from('vehicle_inspections')
        .update({
          owner_review_status: input.status,
          owner_review_comment: input.comment || null,
          owner_flag_reason: input.status === 'flagged' ? (input.flagReason ?? null) : null,
          owner_reviewed_at: new Date().toISOString(),
        })
        .eq('id', input.inspectionId)

      if (error) throw error

      if (input.status === 'approved') {
        await supabase.rpc('award_inspection_trust_points', {
          p_inspection_id: input.inspectionId,
          p_points: INSPECTION_APPROVAL_TRUST_POINTS,
          p_action_type: 'inspection_approved',
        })
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['driver-inspections-for-owner', driverId] })
      queryClient.invalidateQueries({ queryKey: ['inspection-report', variables.inspectionId] })
    },
  })
}
