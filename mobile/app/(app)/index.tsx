import { View, StyleSheet, ScrollView, Pressable } from 'react-native'
import { Text, Button } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { useActiveRental } from '../../src/hooks/useActiveRental'
import { useDriverProfile } from '../../src/hooks/useDriverProfile'
import { useMyProfile } from '../../src/hooks/useMyProfile'
import { useMyLiveStatus } from '../../src/hooks/useMyLiveStatus'
import { useTrustScoreTrend } from '../../src/hooks/useTrustScoreTrend'
import { useRecentActivity } from '../../src/hooks/useRecentActivity'
import { useAuthStore } from '../../src/stores/authStore'
import { LoadingScreen } from '../../src/components/LoadingScreen'
import { TrustScoreRing } from '../../src/components/TrustScoreRing'
import { IconBadge } from '../../src/components/IconBadge'
import { getNextOccurrence, formatShortDate } from '../../src/utils/schedule'
import { computePaymentRecord } from '../../src/utils/paymentRecord'
import { brandColors, radius, cardShadow } from '../../src/theme/theme'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
}

function trustScoreLabel(score: number | null | undefined): string {
  if (score == null) return 'Not Rated'
  if (score >= 80) return 'Excellent'
  if (score >= 50) return 'Fair Standing'
  return 'Needs Improvement'
}

type AttentionItem = {
  key: string
  title: string
  subtitle: string
  urgent: boolean
  onPress: () => void
}

export default function HomeScreen() {
  const router = useRouter()
  const { data: activeRental, isLoading } = useActiveRental()
  const { data: driverProfile } = useDriverProfile()
  const { data: myProfile } = useMyProfile()
  const { data: liveStatus } = useMyLiveStatus()
  const { data: trendPoints } = useTrustScoreTrend()
  const { data: recentActivity } = useRecentActivity()
  const signOut = useAuthStore((s) => s.signOut)

  if (isLoading) return <LoadingScreen />

  if (!activeRental) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="headlineSmall" style={styles.emptyTitle}>
          No Active Rental Yet
        </Text>
        <Text variant="bodyMedium" style={styles.emptyBody}>
          This app unlocks once you've been matched with a vehicle owner. Keep an eye on your
          email — once a match is confirmed on the TrustMate website, your rental will appear
          here.
        </Text>
        {myProfile?.role === 'both' && (
          <Button mode="outlined" onPress={() => router.push('/owner')} style={styles.switchButton}>
            Switch to Owner View
          </Button>
        )}
        <Button mode="outlined" onPress={signOut} style={styles.signOutButton}>
          Sign Out
        </Button>
      </View>
    )
  }

  const car = activeRental.cars
  const firstName = myProfile?.full_name?.split(' ')[0] ?? 'Driver'
  const isMoving = liveStatus?.is_moving ?? false

  const nextInspection = getNextOccurrence(car?.weekly_checkin_day ?? null, car?.checkin_time ?? null)
  const nextPayment = getNextOccurrence(car?.weekly_checkin_day ?? null, car?.checkin_time ?? null)
  const paymentRecord = computePaymentRecord(activeRental.matched_at, driverProfile?.ontime_payments ?? null)

  const attentionItems: AttentionItem[] = []
  if (nextPayment) {
    attentionItems.push({
      key: 'payment',
      title: 'Payment due',
      subtitle: formatShortDate(nextPayment),
      urgent: true,
      onPress: () => router.push('/rental'),
    })
  }
  if (nextInspection) {
    attentionItems.push({
      key: 'inspection',
      title: 'Weekly inspection due',
      subtitle: `${formatShortDate(nextInspection)} · 9 photos, ~3 min`,
      urgent: false,
      onPress: () => router.push('/inspection'),
    })
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text variant="bodyMedium" style={styles.dateText}>
        {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
      </Text>
      <Text variant="headlineMedium" style={styles.greeting}>
        {getGreeting()}, {firstName}
      </Text>

      {myProfile?.role === 'both' && (
        <Button mode="outlined" onPress={() => router.push('/owner')} style={styles.switchButton}>
          Switch to Owner View
        </Button>
      )}

      <View style={styles.card}>
        <View style={styles.rentalHeader}>
          <View style={styles.rentalTitleRow}>
            <IconBadge source="car" backgroundColor="rgba(255,255,255,0.15)" />
            <Text variant="titleLarge" style={styles.rentalTitle}>
              {car ? `${car.make} ${car.model}` : 'Vehicle details unavailable'}
            </Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{isMoving ? 'Driving' : 'Active'}</Text>
          </View>
        </View>
        <View style={styles.rentalMeta}>
          {nextPayment && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Next payment</Text>
              <Text style={styles.metaValue}>{formatShortDate(nextPayment)}</Text>
            </View>
          )}
          {nextInspection && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Next inspection</Text>
              <Text style={styles.metaValue}>{formatShortDate(nextInspection)}</Text>
            </View>
          )}
        </View>
      </View>

      {attentionItems.length > 0 && (
        <>
          <Text variant="labelMedium" style={styles.sectionLabel}>
            NEEDS YOUR ATTENTION
          </Text>
          <View style={styles.card}>
            {attentionItems.map((item, index) => (
              <Pressable
                key={item.key}
                onPress={item.onPress}
                style={[styles.attnRow, index === attentionItems.length - 1 && styles.attnRowLast]}
              >
                <View style={[styles.attnDot, item.urgent && styles.attnDotUrgent]} />
                <View style={styles.attnText}>
                  <Text style={styles.attnTitle}>{item.title}</Text>
                  <Text style={styles.attnSubtitle}>{item.subtitle}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <Text variant="labelMedium" style={styles.sectionLabel}>
        TRUSTSCORE
      </Text>
      <View style={[styles.card, styles.trustCard]}>
        <View style={styles.trustCopy}>
          <Text style={styles.trustLabel}>{trustScoreLabel(driverProfile?.trust_score)}</Text>
          {trendPoints != null && trendPoints !== 0 && (
            <Text style={styles.trendText}>
              <Text style={styles.trendValue}>
                {trendPoints > 0 ? '+' : ''}
                {trendPoints}
              </Text>{' '}
              this month
              {trendPoints > 0 ? ' — on-time payments are your biggest driver.' : ''}
            </Text>
          )}
        </View>
        <TrustScoreRing score={driverProfile?.trust_score ?? 0} />
      </View>

      {paymentRecord && (
        <View style={styles.card}>
          <Text variant="labelMedium" style={styles.cardHeading}>
            DRIVER RECORD
          </Text>
          <Text style={styles.recordValue}>
            {paymentRecord.weeksOnTime} of {paymentRecord.weeksElapsed} weeks paid on time
          </Text>
          <View style={styles.recordTrack}>
            <View
              style={[
                styles.recordFill,
                { width: `${Math.min(100, (paymentRecord.weeksOnTime / paymentRecord.weeksElapsed) * 100)}%` },
              ]}
            />
          </View>
        </View>
      )}

      {recentActivity && recentActivity.length > 0 && (
        <>
          <Text variant="labelMedium" style={styles.sectionLabel}>
            RECENT ACTIVITY
          </Text>
          <View style={styles.card}>
            {recentActivity.slice(0, 2).map((item, index) => (
              <Pressable
                key={`${item.type}-${item.id}`}
                disabled={item.type !== 'trip'}
                onPress={item.type === 'trip' ? () => router.push(`/activity/${item.trip.id}`) : undefined}
                style={[styles.activityRow, index === 0 && recentActivity.length > 1 && styles.activityRowBorder]}
              >
                <IconBadge
                  source={item.type === 'trip' ? 'map-marker' : 'clipboard-check-outline'}
                  backgroundColor="rgba(255,255,255,0.15)"
                  size={14}
                />
                <View style={styles.activityText}>
                  {item.type === 'trip' ? (
                    <>
                      <Text style={styles.activityTitle}>
                        {item.trip.start_location ?? 'Unknown'} → {item.trip.end_location ?? 'Unknown'}
                      </Text>
                      <Text style={styles.activitySub}>
                        {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ·{' '}
                        {(item.trip.distance_km ?? 0).toFixed(1)} km
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.activityTitle}>Inspection {item.inspection.status}</Text>
                      <Text style={styles.activitySub}>
                        {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </Text>
                    </>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        </>
      )}
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
  dateText: {
    color: brandColors.charcoalSoft,
  },
  greeting: {
    color: brandColors.charcoal,
    marginTop: 2,
    marginBottom: 16,
  },
  switchButton: {
    marginBottom: 16,
  },
  sectionLabel: {
    color: brandColors.charcoalSoft,
    letterSpacing: 0.5,
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
  cardHeading: {
    color: brandColors.inkOnCardSoft,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  rentalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rentalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  rentalTitle: {
    color: brandColors.inkOnCard,
    flexShrink: 1,
  },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: {
    color: brandColors.inkOnCard,
    fontWeight: '700',
    fontSize: 12,
  },
  rentalMeta: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 16,
  },
  metaItem: {},
  metaLabel: {
    color: brandColors.inkOnCardSoft,
    fontSize: 12,
    marginBottom: 2,
  },
  metaValue: {
    color: brandColors.inkOnCard,
    fontWeight: '700',
  },
  attnRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  attnRowLast: {
    paddingBottom: 0,
    marginBottom: 0,
    borderBottomWidth: 0,
  },
  attnDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: brandColors.gold,
    marginTop: 5,
  },
  attnDotUrgent: {
    backgroundColor: brandColors.alert,
  },
  attnText: {
    flex: 1,
  },
  attnTitle: {
    color: brandColors.inkOnCard,
    fontWeight: '700',
  },
  attnSubtitle: {
    color: brandColors.inkOnCardSoft,
    marginTop: 2,
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
  trendText: {
    color: brandColors.inkOnCardSoft,
    marginTop: 8,
  },
  trendValue: {
    color: brandColors.gold,
    fontWeight: '700',
  },
  recordValue: {
    color: brandColors.inkOnCard,
    fontWeight: '700',
    marginBottom: 10,
  },
  recordTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  recordFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: brandColors.gold,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  activityRowBorder: {
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  activityText: {
    flex: 1,
  },
  activityTitle: {
    color: brandColors.inkOnCard,
    fontWeight: '700',
  },
  activitySub: {
    color: brandColors.inkOnCardSoft,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyBody: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 32,
  },
  signOutButton: {
    marginTop: 16,
  },
})
