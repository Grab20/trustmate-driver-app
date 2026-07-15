import { useState } from 'react'
import { View, StyleSheet, Pressable } from 'react-native'
import { Text, ActivityIndicator } from 'react-native-paper'
import { IconBadge } from './IconBadge'
import { brandColors } from '../theme/theme'

type AIShotResult = {
  shot: string
  carMatch: boolean | null
  issues: string[]
  quality: string
}

type AIAnalysisData = {
  results?: AIShotResult[]
  error?: string
}

const SHOT_LABELS: Record<string, string> = {
  front: 'Front',
  back: 'Back',
  left: 'Left Side',
  right: 'Right Side',
  interior: 'Interior',
  dashboard: 'Dashboard',
}

const QUALITY_LABELS: Record<string, string> = {
  good: 'Good',
  blurry: 'Blurry',
  too_dark: 'Too dark',
  too_far: 'Too far away',
  too_close: 'Too close',
  obstructed: 'Obstructed view',
}

export function AIAnalysisSummary({
  inspectionType,
  aiAnalysis,
  aiAnalyzedAt,
}: {
  inspectionType: string
  aiAnalysis: unknown
  aiAnalyzedAt: string | null
}) {
  const [expanded, setExpanded] = useState(false)

  if (inspectionType !== 'weekly_checkin') return null

  if (!aiAnalyzedAt) {
    return (
      <View style={styles.pendingBanner}>
        <ActivityIndicator size={16} color={brandColors.green} />
        <Text variant="bodySmall" style={styles.pendingText}>
          AI review in progress…
        </Text>
      </View>
    )
  }

  const data = aiAnalysis as AIAnalysisData | null
  if (!data || data.error || !data.results || data.results.length === 0) {
    return (
      <View style={styles.pendingBanner}>
        <IconBadge source="robot-confused-outline" size={14} backgroundColor="#B8B8AE" />
        <Text variant="bodySmall" style={styles.pendingText}>
          AI review unavailable for this inspection.
        </Text>
      </View>
    )
  }

  const mismatches = data.results.filter((r) => r.carMatch === false)
  const withIssues = data.results.filter((r) => r.issues.length > 0)
  const withQualityIssues = data.results.filter((r) => r.quality && r.quality !== 'good')
  const hasFlags = mismatches.length > 0 || withIssues.length > 0 || withQualityIssues.length > 0

  return (
    <View>
      <Pressable
        onPress={() => setExpanded((prev) => !prev)}
        style={[styles.summaryBanner, hasFlags ? styles.summaryBannerAlert : styles.summaryBannerOk]}
      >
        <IconBadge
          source={hasFlags ? 'alert-circle' : 'check-circle'}
          size={14}
          backgroundColor={hasFlags ? '#B5651D' : brandColors.green}
        />
        <Text variant="bodySmall" style={styles.summaryText}>
          {hasFlags ? 'AI Review: possible issues found' : 'AI Review: no issues found'}
        </Text>
        <IconBadge source={expanded ? 'chevron-up' : 'chevron-down'} size={12} backgroundColor="transparent" color="#8A8A8A" />
      </Pressable>

      {expanded && (
        <View style={styles.detailsBox}>
          {data.results.map((result) => (
            <View key={result.shot} style={styles.detailRow}>
              <Text variant="bodySmall" style={styles.detailShotLabel}>
                {SHOT_LABELS[result.shot] ?? result.shot}
              </Text>
              {result.carMatch === false && (
                <Text variant="bodySmall" style={styles.detailAlert}>
                  Possible different vehicle
                </Text>
              )}
              {result.issues.length > 0 && (
                <Text variant="bodySmall" style={styles.detailAlert}>
                  {result.issues.join(', ')}
                </Text>
              )}
              {result.quality && result.quality !== 'good' && (
                <Text variant="bodySmall" style={styles.detailWarn}>
                  {QUALITY_LABELS[result.quality] ?? result.quality}
                </Text>
              )}
              {result.carMatch !== false && result.issues.length === 0 && (!result.quality || result.quality === 'good') && (
                <Text variant="bodySmall" style={styles.detailOk}>
                  Looks good
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  pendingText: {
    opacity: 0.6,
  },
  summaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  summaryBannerOk: {
    backgroundColor: '#DFF5E6',
  },
  summaryBannerAlert: {
    backgroundColor: '#FBE8C8',
  },
  summaryText: {
    flex: 1,
    fontWeight: '600',
  },
  detailsBox: {
    marginTop: 8,
    paddingLeft: 8,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  detailShotLabel: {
    fontWeight: '700',
    width: 80,
  },
  detailAlert: {
    color: '#B5651D',
  },
  detailWarn: {
    color: '#8A6D00',
  },
  detailOk: {
    opacity: 0.6,
  },
})
