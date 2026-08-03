import { View, StyleSheet } from 'react-native'
import { Text, Card } from 'react-native-paper'
import { IconBadge } from './IconBadge'
import { SectionLabel } from './SectionLabel'
import type { DrivingSafetySummary, EventHistoryItem, SafetyEventCounts, TripMetrics } from '../hooks/useDrivingSafety'
import { scoreBandFor } from '../hooks/useDrivingSafety'
import { brandColors, radius } from '../theme/theme'

type MetricRowConfig = {
  key: keyof DrivingSafetySummary['counts']
  cleanLabel: string
  issueLabel: (count: number) => string
}

const METRIC_ROWS: MetricRowConfig[] = [
  { key: 'speeding', cleanLabel: 'No speeding detected', issueLabel: (n) => `${n} speeding ${n === 1 ? 'event' : 'events'}` },
  { key: 'harshBraking', cleanLabel: 'No harsh braking detected', issueLabel: (n) => `${n} harsh braking ${n === 1 ? 'event' : 'events'}` },
  {
    key: 'harshAcceleration',
    cleanLabel: 'No harsh acceleration detected',
    issueLabel: (n) => `${n} harsh acceleration ${n === 1 ? 'event' : 'events'}`,
  },
  { key: 'harshCornering', cleanLabel: 'No harsh cornering detected', issueLabel: (n) => `${n} harsh cornering ${n === 1 ? 'event' : 'events'}` },
]

const TIP_CONFIG: Record<keyof SafetyEventCounts, { noun: string; action: string }> = {
  speeding: { noun: 'speeding', action: 'Watch your speed on faster roads.' },
  harshBraking: { noun: 'harsh braking', action: 'Brake more smoothly — ease onto the brake earlier instead of braking hard.' },
  harshAcceleration: { noun: 'harsh acceleration', action: 'Reduce harsh acceleration by easing onto the throttle.' },
  harshCornering: { noun: 'harsh cornering', action: 'Take corners a little slower for a smoother, safer ride.' },
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  harsh_braking: 'Harsh Braking',
  harsh_acceleration: 'Harsh Acceleration',
  harsh_cornering: 'Harsh Cornering',
  speeding: 'Speeding',
}

function formatHoursMinutes(totalSeconds: number): string {
  const totalMinutes = Math.round(totalSeconds / 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function formatSpeed(kmh: number | null): string {
  return kmh != null ? `${Math.round(kmh)} km/h` : '—'
}

// Quantifies each tip against last week's count where the comparison is
// meaningful (last week wasn't zero) — praise for genuine improvement,
// otherwise the plain coaching tip.
function buildTips(counts: SafetyEventCounts, previousCounts: SafetyEventCounts): string[] {
  const tips: string[] = []
  ;(Object.keys(TIP_CONFIG) as (keyof SafetyEventCounts)[]).forEach((key) => {
    const count = counts[key]
    if (count === 0) return
    const prev = previousCounts[key]
    const { noun, action } = TIP_CONFIG[key]
    if (prev > count) {
      const percent = Math.round(((prev - count) / prev) * 100)
      tips.push(`Nice work — ${noun} is down ${percent}% vs last week. ${action}`)
    } else if (prev > 0 && count > prev) {
      const percent = Math.round(((count - prev) / prev) * 100)
      tips.push(`${action} (${noun} up ${percent}% vs last week.)`)
    } else {
      tips.push(action)
    }
  })
  if (tips.length === 0) tips.push('Keep it up — no risky driving detected this week.')
  return tips
}

function trendDescription(score: number, previousScore: number): { text: string; icon: string; color: string } {
  const diff = score - previousScore
  if (diff === 0) return { text: 'No change from last week', icon: 'minus', color: '#8A8A8A' }
  const percent = previousScore > 0 ? Math.round((Math.abs(diff) / previousScore) * 100) : Math.abs(diff)
  const unit = previousScore > 0 ? '%' : ' pts'
  return diff > 0
    ? { text: `Improved by ${percent}${unit}`, icon: 'arrow-up-bold', color: brandColors.emerald }
    : { text: `Dropped by ${percent}${unit}`, icon: 'arrow-down-bold', color: brandColors.alert }
}

function ScoreBadge({ score }: { score: number }) {
  const band = scoreBandFor(score)
  return (
    <View style={styles.scoreRow}>
      <View style={{ flex: 1 }}>
        <Text variant="labelSmall" style={styles.scoreLabel}>
          SAFETY SCORE
        </Text>
        <Text variant="displaySmall" style={styles.scoreValue}>
          {score}
          <Text variant="titleMedium" style={styles.scoreOutOf}>
            {' '}
            / 100
          </Text>
        </Text>
      </View>
      <View style={[styles.bandPill, { backgroundColor: `${band.color}1A` }]}>
        <Text style={styles.bandEmoji}>{band.emoji}</Text>
        <Text variant="labelMedium" style={[styles.bandLabel, { color: band.color }]}>
          {band.label}
        </Text>
      </View>
    </View>
  )
}

function TripMetricsGrid({ metrics }: { metrics: TripMetrics }) {
  const cells: { label: string; value: string }[] = [
    { label: 'Distance', value: `${metrics.totalDistanceKm.toFixed(1)} km` },
    { label: 'Trips', value: `${metrics.totalTrips}` },
    { label: 'Driving Time', value: formatHoursMinutes(metrics.totalDurationSeconds) },
    { label: 'Idle Time', value: formatHoursMinutes(metrics.idleSeconds) },
    { label: 'Avg Speed', value: formatSpeed(metrics.avgSpeedKmh) },
    { label: 'Max Speed', value: formatSpeed(metrics.maxSpeedKmh) },
    { label: 'Night Trips', value: `${metrics.nightTrips}` },
    { label: 'Weekend Trips', value: `${metrics.weekendTrips}` },
  ]

  return (
    <View style={styles.metricsBlock}>
      <Text variant="labelSmall" style={styles.sectionSubLabel}>
        THIS WEEK'S TRIP METRICS
      </Text>
      <View style={styles.grid}>
        {cells.map((cell) => (
          <View key={cell.label} style={styles.gridCell}>
            <Text variant="titleMedium" style={styles.gridValue}>
              {cell.value}
            </Text>
            <Text variant="bodySmall" style={styles.gridLabel}>
              {cell.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}

function EventHistoryList({ events }: { events: EventHistoryItem[] }) {
  if (events.length === 0) return null
  return (
    <View style={styles.assessmentBlock}>
      <Text variant="labelSmall" style={styles.sectionSubLabel}>
        EVENT HISTORY
      </Text>
      {events.map((event) => (
        <View key={event.id} style={styles.historyRow}>
          <IconBadge source="alert-circle" size={12} backgroundColor="transparent" color="#B5651D" />
          <Text variant="bodyMedium" style={styles.historyText}>
            {EVENT_TYPE_LABELS[event.eventType] ?? event.eventType}
            {event.speedKmh != null ? ` — ${Math.round(event.speedKmh)} km/h` : ''}
          </Text>
          <Text variant="bodySmall" style={styles.historyDate}>
            {new Date(event.occurredAt).toLocaleString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      ))}
    </View>
  )
}

export function DrivingSafetyCard({
  summary,
  variant,
}: {
  summary: DrivingSafetySummary
  variant: 'owner' | 'driver'
}) {
  if (variant === 'owner') {
    const trend = trendDescription(summary.score, summary.previousScore)
    return (
      <>
        <SectionLabel icon="shield-car" label="DRIVER SAFETY" />
        <Card style={styles.card}>
          <Card.Content>
            <ScoreBadge score={summary.score} />

            <View style={styles.trendRow}>
              <IconBadge source={trend.icon} size={12} backgroundColor="transparent" color={trend.color} />
              <Text variant="bodyMedium" style={[styles.trendText, { color: trend.color }]}>
                {trend.text}
              </Text>
              <Text variant="bodySmall" style={styles.trendSub}>
                vs last week
              </Text>
            </View>

            <Text variant="labelSmall" style={styles.sectionSubLabel}>
              THIS WEEK
            </Text>
            {METRIC_ROWS.map((row) => {
              const count = summary.counts[row.key]
              const isClean = count === 0
              return (
                <View key={row.key} style={styles.metricRow}>
                  <IconBadge
                    source={isClean ? 'check' : 'alert'}
                    size={12}
                    backgroundColor="transparent"
                    color={isClean ? brandColors.emerald : '#B5651D'}
                  />
                  <Text variant="bodyMedium" style={[styles.metricText, !isClean && styles.metricTextWarn]}>
                    {isClean ? row.cleanLabel : row.issueLabel(count)}
                  </Text>
                </View>
              )
            })}

            <TripMetricsGrid metrics={summary.tripMetrics} />

            <View style={styles.assessmentBlock}>
              <Text variant="labelSmall" style={styles.sectionSubLabel}>
                OVERALL ASSESSMENT
              </Text>
              <Text variant="titleMedium" style={styles.assessmentText}>
                {summary.label}
              </Text>
            </View>

            <EventHistoryList events={summary.eventHistory} />
          </Card.Content>
        </Card>
      </>
    )
  }

  const trend = trendDescription(summary.score, summary.previousScore)
  const tips = buildTips(summary.counts, summary.previousCounts)

  return (
    <>
      <SectionLabel icon="shield-car" label="DRIVING BEHAVIOUR" />
      <Card style={styles.card}>
        <Card.Content>
          <ScoreBadge score={summary.score} />

          <View style={styles.trendRow}>
            <IconBadge source={trend.icon} size={12} backgroundColor="transparent" color={trend.color} />
            <Text variant="bodyMedium" style={[styles.trendText, { color: trend.color }]}>
              {trend.text}
            </Text>
            <Text variant="bodySmall" style={styles.trendSub}>
              vs last week
            </Text>
          </View>

          <TripMetricsGrid metrics={summary.tripMetrics} />

          <View style={styles.assessmentBlock}>
            <Text variant="labelSmall" style={styles.sectionSubLabel}>
              TIPS
            </Text>
            {tips.map((tip, index) => (
              <View key={index} style={styles.tipRow}>
                <Text style={styles.tipBullet}>•</Text>
                <Text variant="bodyMedium" style={styles.tipText}>
                  {tip}
                </Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
    </>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreLabel: {
    color: brandColors.charcoalSoft,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  scoreValue: {
    color: brandColors.deep,
  },
  scoreOutOf: {
    color: brandColors.charcoalSoft,
  },
  bandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
  },
  bandEmoji: {
    fontSize: 14,
  },
  bandLabel: {
    fontWeight: '700',
  },
  sectionSubLabel: {
    color: brandColors.charcoalSoft,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  metricText: {
    flex: 1,
    opacity: 0.85,
  },
  metricTextWarn: {
    color: '#B5651D',
    fontWeight: '600',
    opacity: 1,
  },
  metricsBlock: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E3E3DD',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  gridCell: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  gridValue: {
    color: brandColors.deep,
  },
  gridLabel: {
    color: brandColors.charcoalSoft,
    opacity: 0.85,
  },
  assessmentBlock: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E3E3DD',
  },
  assessmentText: {
    color: brandColors.deep,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F4F7F5',
    borderRadius: radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  trendText: {
    fontWeight: '700',
  },
  trendSub: {
    opacity: 0.5,
    marginLeft: 'auto',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  historyText: {
    flex: 1,
    opacity: 0.85,
  },
  historyDate: {
    color: brandColors.charcoalSoft,
    opacity: 0.7,
  },
  tipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  tipBullet: {
    color: brandColors.emerald,
    fontWeight: '700',
  },
  tipText: {
    flex: 1,
    opacity: 0.85,
  },
})
