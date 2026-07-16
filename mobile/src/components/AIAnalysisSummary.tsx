import { useState } from 'react'
import { View, StyleSheet, Pressable } from 'react-native'
import { Text, ActivityIndicator } from 'react-native-paper'
import { IconBadge } from './IconBadge'
import { brandColors } from '../theme/theme'
import { isVehicleHealthReport } from '../types/inspectionReport'

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

  if (!isVehicleHealthReport(aiAnalysis)) {
    return (
      <View style={styles.pendingBanner}>
        <IconBadge source="robot-confused-outline" size={14} backgroundColor="#B8B8AE" />
        <Text variant="bodySmall" style={styles.pendingText}>
          AI review unavailable for this inspection.
        </Text>
      </View>
    )
  }

  const report = aiAnalysis
  const hasFlags = report.healthScore < 90

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
          Vehicle Health: {report.healthScore}/100 · {report.healthLabel}
        </Text>
        <IconBadge source={expanded ? 'chevron-up' : 'chevron-down'} size={12} backgroundColor="transparent" color="#8A8A8A" />
      </Pressable>

      {expanded && (
        <View style={styles.detailsBox}>
          {report.summary.map((bullet, index) => (
            <View key={index} style={styles.detailRow}>
              <IconBadge
                source={bullet.ok ? 'check' : 'alert'}
                size={12}
                backgroundColor="transparent"
                color={bullet.ok ? brandColors.green : '#B5651D'}
              />
              <Text variant="bodySmall" style={[styles.detailText, !bullet.ok && styles.detailAlert]}>
                {bullet.text}
              </Text>
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
    gap: 6,
  },
  detailText: {
    flex: 1,
    opacity: 0.8,
  },
  detailAlert: {
    color: '#B5651D',
    opacity: 1,
  },
})
