import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import type { Tables } from '../types/database'

export type ActivityItem =
  | { type: 'trip'; id: string; date: string; trip: Tables<'vehicle_trips'> }
  | { type: 'inspection'; id: string; date: string; inspection: Tables<'vehicle_inspections'> }

const ACTIVITY_LIMIT = 15

export function useRecentActivity() {
  const userId = useAuthStore((s) => s.session?.user.id)

  return useQuery({
    queryKey: ['recent-activity', userId],
    queryFn: async (): Promise<ActivityItem[]> => {
      const driverId = userId as string

      const [tripsResult, inspectionsResult] = await Promise.all([
        supabase
          .from('vehicle_trips')
          .select('*')
          .eq('driver_id', driverId)
          .eq('status', 'completed')
          .order('started_at', { ascending: false })
          .limit(ACTIVITY_LIMIT),
        supabase
          .from('vehicle_inspections')
          .select('*')
          .eq('driver_id', driverId)
          .order('created_at', { ascending: false })
          .limit(ACTIVITY_LIMIT),
      ])

      if (tripsResult.error) throw tripsResult.error
      if (inspectionsResult.error) throw inspectionsResult.error

      const items: ActivityItem[] = [
        ...tripsResult.data.map(
          (trip): ActivityItem => ({ type: 'trip', id: trip.id, date: trip.started_at, trip }),
        ),
        ...inspectionsResult.data.map(
          (inspection): ActivityItem => ({
            type: 'inspection',
            id: inspection.id,
            date: inspection.created_at ?? new Date(0).toISOString(),
            inspection,
          }),
        ),
      ]

      return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, ACTIVITY_LIMIT)
    },
    enabled: !!userId,
    refetchInterval: 30000,
  })
}
