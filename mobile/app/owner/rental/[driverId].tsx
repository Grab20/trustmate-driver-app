import { View, ScrollView, StyleSheet } from 'react-native'
import { Text, Button } from 'react-native-paper'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useOwnerFleetSummary } from '../../../src/hooks/useOwnerFleetSummary'
import { useDriverProfileForOwner } from '../../../src/hooks/useDriverProfileForOwner'
import { useDriverInspectionsForOwner } from '../../../src/hooks/useInspections'
import { useProfile } from '../../../src/hooks/useProfile'
import { TrustScoreRing } from '../../../src/components/TrustScoreRing'
import { LoadingScreen } from '../../../src/components/LoadingScreen'
import { getRentalWeekNumber } from '../../../src/utils/schedule'
import { brandColors, radius, cardShadow } from '../../../src/theme/theme'

const RENTAL_TERM_WEEKS = 52

function trustScoreLabel(score: number | null | undefined): string {
  if (score == null) return 'Not Rated'
  if (score >= 80) return 'Excellent'
  if (score >= 50) return 'Fair Standing'
  return 'Needs Improvement'
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function OwnerDriverProfileScreen() {
  const router = useRouter()
  const { driverId, carId } = useLocalSearchParams<{ driverId: string; carId: string }>()
  const { data: fleet, isLoading: isFleetLoading } = useOwnerFleetSummary()
  const { data: driverProfile, isLoading: isProfileLoading } = useDriverProfileForOwner(driverId)
  const { data: inspections, isLoading: isInspectionsLoading } = useDriverInspectionsForOwner(driverId)
  const { data: profile } = useProfile(driverId)

  if (isFleetLoading || isProfileLoading || isInspectionsLoading) return <LoadingScreen />

  const entry = fleet?.find((e) => e.driverId === driverId)
  if (!entry) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="bodyMedium">Driver not found.</Text>
      </View>
    )
  }

  const weekNumber = getRentalWeekNumber(entry.matchedAt)
  const weekPercent = weekNumber != null ? Math.min(100, (weekNumber / RENTAL_TERM_WEEKS) * 100) : 0

  const ontime = driverProfile?.ontime_payments ?? 0
  const missed = driverProfile?.missed_payments ?? 0
  const late = driverProfile?.late_payments ?? 0
  const paymentTotal = ontime + missed + late

  const weeklyInspections = (inspections ?? []).filter((i) => i.inspection_type === 'weekly_checkin')
  const completedInspections = weeklyInspections.length
  const hasIncidents = (driverProfile?.accidents ?? 0) > 0 || (driverProfile?.damage_incidents ?? 0) > 0

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.profileHead}>
        <View style={styles.avatarLg}>
          <Text style={styles.avatarLgText}>{getInitials(entry.driverName)}</Text>
        </View>
        <View style={styles.profileHeadText}>
          <Text style={styles.pdName}>{entry.driverName}</Text>
          <Text style={styles.pdSub}>
            {entry.carLabel}
            {entry.matchedAt ? ` · Driver since ${new Date(entry.matchedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}` : ''}
          </Text>
        </View>
      </View>

      {weekNumber != null && (
        <>
          <Text style={styles.sectionLabel}>PAYMENT PROGRESS</Text>
          <View style={styles.card}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>
                Week {weekNumber} of {RENTAL_TERM_WEEKS} paid
              </Text>
              <Text style={styles.progressPercent}>{weekPercent.toFixed(1)}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${weekPercent}%` }]} />
            </View>
          </View>
        </>
      )}

      <Text style={styles.sectionLabel}>TRUSTSCORE</Text>
      <View style={[styles.card, styles.trustCard]}>
        <View style={styles.trustCopy}>
          <Text style={styles.trustLabel}>{trustScoreLabel(entry.trustScore)}</Text>
          {hasIncidents ? (
            <Text style={styles.trustInsight}>Damage or accident on record this year.</Text>
          ) : (
            <Text style={styles.trustInsight}>No accidents or damage incidents.</Text>
          )}
        </View>
        <TrustScoreRing score={entry.trustScore ?? 0} />
      </View>

      <Text style={styles.sectionLabel}>WHAT AFFECTS THIS SCORE</Text>
      <View style={styles.card}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryDot, missed === 0 ? styles.summaryDotOk : styles.summaryDotAlert]}>
            {missed === 0 ? '✓' : '!'}
          </Text>
          <Text style={styles.summaryText}>
            Paid weekly check-in — {ontime}/{paymentTotal || ontime} on time
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryDot, styles.summaryDotOk]}>✓</Text>
          <Text style={styles.summaryText}>Weekly inspections completed — {completedInspections}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryDot, !hasIncidents ? styles.summaryDotOk : styles.summaryDotAlert]}>
            {!hasIncidents ? '✓' : '!'}
          </Text>
          <Text style={styles.summaryText}>
            {!hasIncidents ? 'No accidents or damage incidents' : 'Accident or damage on record'}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>PROFILE</Text>
      <View style={styles.card}>
        <View style={styles.kvRow}>
          <Text style={styles.kvk}>Phone</Text>
          <Text style={styles.kvv}>{profile?.phone ?? '—'}</Text>
        </View>
        <View style={styles.kvRow}>
          <Text style={styles.kvk}>Licence</Text>
          <Text style={styles.kvv}>{driverProfile?.license_verified ? 'Verified' : 'Not verified'}</Text>
        </View>
        <View style={[styles.kvRow, styles.kvRowLast]}>
          <Text style={styles.kvk}>Rentals completed</Text>
          <Text style={styles.kvv}>{driverProfile?.rentals_completed ?? 0}</Text>
        </View>
      </View>

      <Button
        mode="outlined"
        icon="camera-plus-outline"
        style={styles.actionButton}
        onPress={() => router.push(`/owner/driver/reference-photos?carId=${entry.carId ?? carId}`)}
      >
        Manage Reference Photos
      </Button>
      <Button
        mode="text"
        style={styles.actionButton}
        onPress={() =>
          router.push({ pathname: '/owner/driver/[id]', params: { id: entry.driverId, carId: entry.carId ?? carId } })
        }
      >
        View Full Details
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
    paddingBottom: 40,
  },
  profileHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  avatarLg: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: brandColors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLgText: {
    color: brandColors.deep,
    fontWeight: '700',
    fontSize: 17,
  },
  profileHeadText: {
    flex: 1,
  },
  pdName: {
    color: brandColors.charcoal,
    fontSize: 18,
    fontWeight: '700',
  },
  pdSub: {
    color: brandColors.charcoalSoft,
    marginTop: 2,
  },
  sectionLabel: {
    color: brandColors.charcoalSoft,
    letterSpacing: 0.5,
    fontSize: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  card: {
    backgroundColor: brandColors.cardGreen,
    borderRadius: radius.lg,
    padding: 20,
    marginBottom: 8,
    ...cardShadow,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: brandColors.inkOnCard,
    fontWeight: '600',
  },
  progressPercent: {
    color: brandColors.gold,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: brandColors.gold,
  },
  trustCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trustCopy: {
    flex: 1,
    marginRight: 12,
  },
  trustLabel: {
    color: brandColors.inkOnCard,
    fontWeight: '700',
    fontSize: 16,
  },
  trustInsight: {
    color: brandColors.inkOnCardSoft,
    marginTop: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  summaryDot: {
    width: 20,
    textAlign: 'center',
    fontWeight: '700',
  },
  summaryDotOk: {
    color: brandColors.emerald,
  },
  summaryDotAlert: {
    color: brandColors.alert,
  },
  summaryText: {
    color: brandColors.inkOnCard,
    flex: 1,
  },
  kvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  kvRowLast: {
    borderBottomWidth: 0,
  },
  kvk: {
    color: brandColors.inkOnCardSoft,
  },
  kvv: {
    color: brandColors.inkOnCard,
    fontWeight: '600',
  },
  actionButton: {
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
