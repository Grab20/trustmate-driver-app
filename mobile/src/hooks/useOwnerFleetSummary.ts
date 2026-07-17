import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { isVehicleHealthReport } from '../types/inspectionReport'
import type { Tables } from '../types/database'

export type OwnerFleetSummaryEntry = {
  applicationId: string
  driverId: string
  carId: string | null
  driverName: string
  photoUrl: string | null
  carLabel: string
  matchedAt: string | null
  priceWeek: number
  isMoving: boolean
  trustScore: number | null
  missedPayments: number
  lastInspection: {
    id: string
    createdAt: string | null
    reviewStatus: string
    healthScore: number | null
    inspectionNumber: number
  } | null
}

async function fetchOwnerFleetSummary(ownerId: string): Promise<OwnerFleetSummaryEntry[]> {
  const { data: applications, error } = await supabase
    .from('applications')
    .select('*, cars(*), driver:profiles!applications_driver_id_fkey(id, full_name, photo_url)')
    .eq('owner_id', ownerId)
    .eq('status', 'approved')
    .is('unmatched_at', null)

  if (error) throw error
  if (!applications || applications.length === 0) return []

  const driverIds = applications.map((a) => a.driver_id).filter((id): id is string => !!id)

  const [{ data: liveStatuses, error: liveError }, { data: driverProfiles, error: profilesError }, { data: inspections, error: inspectionsError }] =
    await Promise.all([
      supabase.from('driver_live_status').select('*').in('driver_id', driverIds),
      supabase.from('driver_profiles').select('*').in('user_id', driverIds),
      supabase
        .from('vehicle_inspections')
        .select('*')
        .in('driver_id', driverIds)
        .eq('inspection_type', 'weekly_checkin')
        .order('created_at', { ascending: true }),
    ])

  if (liveError) throw liveError
  if (profilesError) throw profilesError
  if (inspectionsError) throw inspectionsError

  const liveStatusByDriverId = new Map((liveStatuses ?? []).map((ls) => [ls.driver_id, ls]))
  const profileByDriverId = new Map((driverProfiles ?? []).map((p) => [p.user_id, p]))

  const inspectionsByDriverId = new Map<string, Tables<'vehicle_inspections'>[]>()
  for (const inspection of inspections ?? []) {
    const list = inspectionsByDriverId.get(inspection.driver_id) ?? []
    list.push(inspection)
    inspectionsByDriverId.set(inspection.driver_id, list)
  }

  return applications.map((application): OwnerFleetSummaryEntry => {
    const driverId = application.driver_id as string
    const profile = profileByDriverId.get(driverId)
    const liveStatus = liveStatusByDriverId.get(driverId)
    const driverInspections = inspectionsByDriverId.get(driverId) ?? []
    const last = driverInspections[driverInspections.length - 1]

    return {
      applicationId: application.id,
      driverId,
      carId: application.car_id,
      driverName: application.driver?.full_name ?? 'Driver',
      photoUrl: application.driver?.photo_url ?? null,
      carLabel: application.cars ? `${application.cars.make} ${application.cars.model}` : 'Vehicle unavailable',
      matchedAt: application.matched_at,
      priceWeek: application.cars?.price_per_week ?? 0,
      isMoving: liveStatus?.is_moving ?? false,
      trustScore: profile?.trust_score ?? null,
      missedPayments: profile?.missed_payments ?? 0,
      lastInspection: last
        ? {
            id: last.id,
            createdAt: last.created_at,
            reviewStatus: last.owner_review_status ?? 'pending',
            healthScore: isVehicleHealthReport(last.ai_analysis) ? last.ai_analysis.healthScore : null,
            inspectionNumber: driverInspections.length,
          }
        : null,
    }
  })
}

export function useOwnerFleetSummary() {
  const ownerId = useAuthStore((s) => s.session?.user.id)

  return useQuery({
    queryKey: ['owner-fleet-summary', ownerId],
    queryFn: () => fetchOwnerFleetSummary(ownerId as string),
    enabled: !!ownerId,
    refetchInterval: 20000,
  })
}
