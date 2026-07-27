import { View, StyleSheet } from 'react-native'
import { Text, Card } from 'react-native-paper'
import { IconBadge } from './IconBadge'
import { SectionLabel } from './SectionLabel'
import type { DrivingSafetySummary } from '../hooks/useDrivingSafety'
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

function buildTips(counts: DrivingSafetySummary['counts']): string[] {
  const tips: string[] = []
  if (counts.harshBraking > 0) tips.push('Brake more smoothly — ease onto the brake earlier instead of braking hard.')
  if (counts.harshAcceleration > 0) tips.push('Reduce harsh acceleration by easing onto the throttle.')
  if (counts.harshCornering > 0) tips.push('Take corners a little slower for a smoother, safer ride.')
  if (counts.speeding > 0) tips.push('Watch your speed on faster roads.')
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

export function DrivingSafetyCard({
  summary,
  variant,
}: {
  summary: DrivingSafetySummary
  variant: 'owner' | 'driver'
}) {
  if (variant === 'owner') {
    return (
      <>
        <SectionLabel icon="shield-car" label="DRIVER SAFETY" />
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.scoreRow}>
              <View>
                <Text variant="labelSmall" style={styles.scoreLabel}>
                  SAFETY SCORE
                </Text>
                <Text variant="displaySmall" style={styles.scoreValue}>
                  {summary.score}
                  <Text variant="titleMedium" style={styles.scoreOutOf}>
                    {' '}
                    / 100
                  </Text>
                </Text>
              </View>
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

            <View style={styles.assessmentBlock}>
              <Text variant="labelSmall" style={styles.sectionSubLabel}>
                OVERALL ASSESSMENT
              </Text>
              <Text variant="titleMedium" style={styles.assessmentText}>
                {summary.label}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </>
    )
  }

  const trend = trendDescription(summary.score, summary.previousScore)
  const tips = buildTips(summary.counts)

  return (
    <>
      <SectionLabel icon="shield-car" label="DRIVING BEHAVIOUR" />
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.scoreRow}>
            <View>
              <Text variant="labelSmall" style={styles.scoreLabel}>
                SAFETY SCORE
              </Text>
              <Text variant="displaySmall" style={styles.scoreValue}>
                {summary.score}
                <Text variant="titleMedium" style={styles.scoreOutOf}>
                  {' '}
                  / 100
                </Text>
              </Text>
            </View>
          </View>

          <View style={styles.trendRow}>
            <IconBadge source={trend.icon} size={12} backgroundColor="transparent" color={trend.color} />
            <Text variant="bodyMedium" style={[styles.trendText, { color: trend.color }]}>
              {trend.text}
            </Text>
            <Text variant="bodySmall" style={styles.trendSub}>
              vs last week
            </Text>
          </View>

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
  },
  trendText: {
    fontWeight: '700',
  },
  trendSub: {
    opacity: 0.5,
    marginLeft: 'auto',
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
