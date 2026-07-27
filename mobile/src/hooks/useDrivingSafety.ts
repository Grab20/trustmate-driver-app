import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export type SafetyEventCounts = {
  harshBraking: number
  harshAcceleration: number
  harshCornering: number
  speeding: number
}

export type DrivingSafetySummary = {
  score: number
  label: string
  counts: SafetyEventCounts
  previousScore: number
}

// Rental weeks run Monday-Sunday (matches useDistanceTotals' convention).
function startOfWeekIso(weeksAgo: number): string {
  const now = new Date()
  const diffToMonday = (now.getDay() + 6) % 7
  const monday = new Date(now)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(now.getDate() - diffToMonday - weeksAgo * 7)
  return monday.toISOString()
}

const EMPTY_COUNTS: SafetyEventCounts = { harshBraking: 0, harshAcceleration: 0, harshCornering: 0, speeding: 0 }

function countEvents(rows: { event_type: string }[]): SafetyEventCounts {
  const counts = { ...EMPTY_COUNTS }
  for (const row of rows) {
    if (row.event_type === 'harsh_braking') counts.harshBraking++
    else if (row.event_type === 'harsh_acceleration') counts.harshAcceleration++
    else if (row.event_type === 'harsh_cornering') counts.harshCornering++
    else if (row.event_type === 'speeding') counts.speeding++
  }
  return counts
}

// This scoring is for on-screen display only — the actual TrustScore
// adjustment happens server-side on a weekly schedule and is never
// client-invocable, so a driver's own device can't inflate their own score.
// The exact weighting is deliberately not shown anywhere in the UI.
function scoreFromCounts(counts: SafetyEventCounts): number {
  let score = 100
  score -= Math.min(20, counts.harshBraking * 4)
  score -= Math.min(20, counts.harshAcceleration * 4)
  score -= Math.min(20, counts.harshCornering * 4)
  score -= Math.min(24, counts.speeding * 8)
  return Math.max(0, Math.round(score))
}

export function labelForSafetyScore(score: number): string {
  if (score >= 90) return 'Excellent Driving Behaviour'
  if (score >= 75) return 'Good Driving Behaviour'
  if (score >= 60) return 'Fair Driving Behaviour'
  return 'Needs Improvement'
}

export function useDrivingSafetySummary(driverId: string | undefined) {
  return useQuery({
    queryKey: ['driving-safety-summary', driverId],
    queryFn: async (): Promise<DrivingSafetySummary> => {
      const twoWeeksAgoIso = startOfWeekIso(1)
      const { data, error } = await supabase
        .from('driving_events')
        .select('event_type, occurred_at')
        .eq('driver_id', driverId as string)
        .gte('occurred_at', twoWeeksAgoIso)

      if (error) throw error

      const thisWeekStart = startOfWeekIso(0)
      const thisWeekRows = data.filter((r) => r.occurred_at >= thisWeekStart)
      const lastWeekRows = data.filter((r) => r.occurred_at < thisWeekStart)

      const counts = countEvents(thisWeekRows)
      const score = scoreFromCounts(counts)
      const previousScore = scoreFromCounts(countEvents(lastWeekRows))

      return { score, label: labelForSafetyScore(score), counts, previousScore }
    },
    enabled: !!driverId,
    refetchInterval: 60000,
  })
}
