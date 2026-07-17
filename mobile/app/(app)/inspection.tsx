import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Card, Button } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { useActiveRental } from '../../src/hooks/useActiveRental'
import { useInspectionHistory } from '../../src/hooks/useInspections'
import { LoadingScreen } from '../../src/components/LoadingScreen'
import { IconBadge } from '../../src/components/IconBadge'
import { getNextOccurrence, formatShortDate } from '../../src/utils/schedule'
import { isVehicleHealthReport } from '../../src/types/inspectionReport'
import { brandColors, radius, cardShadow } from '../../src/theme/theme'
import type { Tables } from '../../src/types/database'

const STATUS_CONFIG: Record<string, { label: string; icon: string }> = {
  approved: { label: 'Approved', icon: 'check' },
  declined: { label: 'Declined', icon: 'close' },
  reinspection_requested: { label: 'Re-inspection requested', icon: 'alert' },
  flagged: { label: 'Flagged by owner', icon: 'flag' },
  pending: { label: 'Awaiting review', icon: 'clock-outline' },
}

function historyRow(inspection: Tables<'vehicle_inspections'>) {
  const report = isVehicleHealthReport(inspection.ai_analysis) ? inspection.ai_analysis : null
  const status = STATUS_CONFIG[inspection.owner_review_status ?? 'pending'] ?? STATUS_CONFIG.pending
  return { inspection, report, status }
}

export default function InspectionTabScreen() {
  const router = useRouter()
  const { data: activeRental, isLoading: isRentalLoading } = useActiveRental()
  const { data: inspections, isLoading: isHistoryLoading } = useInspectionHistory()

  if (isRentalLoading || isHistoryLoading) return <LoadingScreen />

  const car = activeRental?.cars
  const nextInspection = getNextOccurrence(car?.weekly_checkin_day ?? null, car?.checkin_time ?? null)
  const weeklyInspections = (inspections ?? [])
    .filter((i) => i.inspection_type === 'weekly_checkin')
    .slice(0, 3)
    .map(historyRow)

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {nextInspection && (
        <Card style={styles.attnCard}>
          <Card.Content style={styles.attnContent}>
            <IconBadge source="clipboard-check-outline" backgroundColor="rgba(255,255,255,0.15)" />
            <View style={styles.attnText}>
              <Text variant="titleMedium" style={styles.attnTitle}>
                Due {formatShortDate(nextInspection)}
              </Text>
              <Text variant="bodySmall" style={styles.attnSub}>
                9 photos · takes about 3 minutes
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}

      <Button mode="contained" onPress={() => router.push('/rental/inspections/new')} style={styles.startButton}>
        Start inspection
      </Button>

      <Text variant="labelMedium" style={styles.sectionLabel}>
        HISTORY
      </Text>
      {weeklyInspections.length > 0 ? (
        <Card style={styles.historyCard}>
          <Card.Content>
            {weeklyInspections.map(({ inspection, report, status }, index) => (
              <View
                key={inspection.id}
                style={[styles.historyRow, index === weeklyInspections.length - 1 && styles.historyRowLast]}
              >
                <IconBadge source={status.icon} size={14} backgroundColor="rgba(255,255,255,0.15)" />
                <View style={styles.historyText}>
                  <Text variant="bodyMedium" style={styles.historyTitle}>
                    {new Date(inspection.created_at ?? '').toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                    })}{' '}
                    · {status.label}
                  </Text>
                </View>
                {report && (
                  <Text variant="bodyMedium" style={styles.historyScore}>
                    {report.healthScore}/100
                  </Text>
                )}
              </View>
            ))}
          </Card.Content>
        </Card>
      ) : (
        <Text variant="bodyMedium" style={styles.empty}>
          No inspections submitted yet.
        </Text>
      )}

      <Button mode="text" onPress={() => router.push('/rental/inspections')} style={styles.viewAllButton}>
        View all inspections
      </Button>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: brandColors.paper,
  },
  container: {
    padding: 24,
  },
  attnCard: {
    backgroundColor: brandColors.cardGreen,
    borderRadius: radius.lg,
    marginBottom: 16,
    ...cardShadow,
  },
  attnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  attnText: {
    flex: 1,
  },
  attnTitle: {
    color: brandColors.inkOnCard,
  },
  attnSub: {
    color: brandColors.inkOnCardSoft,
    marginTop: 2,
  },
  startButton: {
    marginBottom: 24,
  },
  sectionLabel: {
    color: brandColors.charcoalSoft,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  historyCard: {
    backgroundColor: brandColors.cardGreen,
    borderRadius: radius.lg,
    marginBottom: 8,
    ...cardShadow,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  historyRowLast: {
    marginBottom: 0,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  historyText: {
    flex: 1,
  },
  historyTitle: {
    color: brandColors.inkOnCard,
  },
  historyScore: {
    color: brandColors.gold,
    fontWeight: '700',
  },
  empty: {
    color: brandColors.charcoalSoft,
    marginBottom: 8,
  },
  viewAllButton: {
    marginBottom: 24,
  },
})
