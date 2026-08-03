import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export type SafetyEventCounts = {
  harshBraking: number
  harshAcceleration: number
  harshCornering: number
  speeding: number
}

export type TripMetrics = {
  totalTrips: number
  totalDistanceKm: number
  totalDurationSeconds: number
  idleSeconds: number
  avgSpeedKmh: number | null
  maxSpeedKmh: number | null
  nightTrips: number
  weekendTrips: number
}

export type EventHistoryItem = {
  id: string
  eventType: string
  occurredAt: string
  severity: number
  speedKmh: number | null
}

export type DrivingSafetySummary = {
  score: number
  label: string
  counts: SafetyEventCounts
  previousScore: number
  previousCounts: SafetyEventCounts
  tripMetrics: TripMetrics
  eventHistory: EventHistoryItem[]
}

export type ScoreBand = {
  emoji: string
  color: string
  label: string
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

// Bands mirror labelForSafetyScore's thresholds — kept as a separate helper
// (rather than folded in) since the card needs the emoji/color, not just the text.
export function scoreBandFor(score: number): ScoreBand {
  if (score >= 90) return { emoji: '🟢', color: '#2E7D32', label: 'Excellent' }
  if (score >= 75) return { emoji: '🟡', color: '#B8860B', label: 'Good' }
  if (score >= 60) return { emoji: '🟠', color: '#B5651D', label: 'Fair' }
  return { emoji: '🔴', color: '#C0392B', label: 'Needs Improvement' }
}

// Night driving is judged against the device's own local time, same as every
// other trip timestamp shown in this app — there's no per-driver timezone
// stored to convert against instead.
const NIGHT_HOUR_START = 20
const NIGHT_HOUR_END = 6

function isNightStart(iso: string): boolean {
  const hour = new Date(iso).getHours()
  return hour >= NIGHT_HOUR_START || hour < NIGHT_HOUR_END
}

function isWeekendStart(iso: string): boolean {
  const day = new Date(iso).getDay()
  return day === 0 || day === 6
}

function computeTripMetrics(trips: { distance_km: number | null; duration_seconds: number | null; idle_seconds: number | null; avg_speed_kmh: number | null; max_speed_kmh: number | null; started_at: string }[]): TripMetrics {
  let totalDistanceKm = 0
  let totalDurationSeconds = 0
  let idleSeconds = 0
  let maxSpeedKmh: number | null = null
  let nightTrips = 0
  let weekendTrips = 0

  for (const trip of trips) {
    totalDistanceKm += trip.distance_km ?? 0
    totalDurationSeconds += trip.duration_seconds ?? 0
    idleSeconds += trip.idle_seconds ?? 0
    if (trip.max_speed_kmh != null) maxSpeedKmh = Math.max(maxSpeedKmh ?? 0, trip.max_speed_kmh)
    if (isNightStart(trip.started_at)) nightTrips++
    if (isWeekendStart(trip.started_at)) weekendTrips++
  }

  const avgSpeedKmh = totalDurationSeconds > 0 ? totalDistanceKm / (totalDurationSeconds / 3600) : null

  return {
    totalTrips: trips.length,
    totalDistanceKm,
    totalDurationSeconds,
    idleSeconds,
    avgSpeedKmh,
    maxSpeedKmh,
    nightTrips,
    weekendTrips,
  }
}

const EMPTY_TRIP_METRICS: TripMetrics = {
  totalTrips: 0,
  totalDistanceKm: 0,
  totalDurationSeconds: 0,
  idleSeconds: 0,
  avgSpeedKmh: null,
  maxSpeedKmh: null,
  nightTrips: 0,
  weekendTrips: 0,
}

export function useDrivingSafetySummary(driverId: string | undefined) {
  return useQuery({
    queryKey: ['driving-safety-summary', driverId],
    queryFn: async (): Promise<DrivingSafetySummary> => {
      const twoWeeksAgoIso = startOfWeekIso(1)
      const thisWeekStart = startOfWeekIso(0)

      const [eventsResult, tripsResult] = await Promise.all([
        supabase
          .from('driving_events')
          .select('id, event_type, occurred_at, severity, speed_kmh')
          .eq('driver_id', driverId as string)
          .gte('occurred_at', twoWeeksAgoIso)
          .order('occurred_at', { ascending: false }),
        supabase
          .from('vehicle_trips')
          .select('distance_km, duration_seconds, idle_seconds, avg_speed_kmh, max_speed_kmh, started_at')
          .eq('driver_id', driverId as string)
          .eq('status', 'completed')
          .gte('started_at', thisWeekStart),
      ])

      if (eventsResult.error) throw eventsResult.error
      if (tripsResult.error) throw tripsResult.error

      const events = eventsResult.data
      const thisWeekRows = events.filter((r) => r.occurred_at >= thisWeekStart)
      const lastWeekRows = events.filter((r) => r.occurred_at < thisWeekStart)

      const counts = countEvents(thisWeekRows)
      const previousCounts = countEvents(lastWeekRows)
      const score = scoreFromCounts(counts)
      const previousScore = scoreFromCounts(previousCounts)

      const eventHistory: EventHistoryItem[] = events.slice(0, 15).map((e) => ({
        id: e.id,
        eventType: e.event_type,
        occurredAt: e.occurred_at,
        severity: e.severity,
        speedKmh: e.speed_kmh,
      }))

      const tripMetrics = tripsResult.data.length > 0 ? computeTripMetrics(tripsResult.data) : EMPTY_TRIP_METRICS

      return { score, label: labelForSafetyScore(score), counts, previousScore, previousCounts, tripMetrics, eventHistory }
    },
    enabled: !!driverId,
    refetchInterval: 60000,
  })
}
