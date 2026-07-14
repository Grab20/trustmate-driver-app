import { useEffect, useState } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Card, Button, Chip } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { useActiveRental } from '../../src/hooks/useActiveRental'
import { useActiveTrip } from '../../src/hooks/useActiveTrip'
import { useDistanceTotals } from '../../src/hooks/useDistanceTotals'
import { useDriverProfile } from '../../src/hooks/useDriverProfile'
import { useMyProfile } from '../../src/hooks/useMyProfile'
import { useMyLiveStatus } from '../../src/hooks/useMyLiveStatus'
import { useTrustScoreTrend } from '../../src/hooks/useTrustScoreTrend'
import { useAuthStore } from '../../src/stores/authStore'
import { LoadingScreen } from '../../src/components/LoadingScreen'
import { StatTile } from '../../src/components/StatTile'
import { AlertBanner } from '../../src/components/AlertBanner'
import { TrustScoreRing } from '../../src/components/TrustScoreRing'
import { IconBadge } from '../../src/components/IconBadge'
import { reverseGeocodeLabel } from '../../src/lib/reverseGeocode'
import { formatElapsedSince, getNextOccurrence, formatShortDate } from '../../src/utils/schedule'
import { computePaymentRecord } from '../../src/utils/paymentRecord'
import { brandColors } from '../../src/theme/theme'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
}

function trustScoreLabel(score: number | null | undefined): string {
  if (score == null) return 'Not Rated'
  if (score >= 80) return 'Good Standing'
  if (score >= 50) return 'Fair Standing'
  return 'Needs Improvement'
}

export default function HomeScreen() {
  const router = useRouter()
  const { data: activeRental, isLoading } = useActiveRental()
  const { data: activeTrip } = useActiveTrip()
  const { data: distanceTotals } = useDistanceTotals()
  const { data: driverProfile } = useDriverProfile()
  const { data: myProfile } = useMyProfile()
  const { data: liveStatus } = useMyLiveStatus()
  const { data: trendPoints } = useTrustScoreTrend()
  const signOut = useAuthStore((s) => s.signOut)
  const [addressLabel, setAddressLabel] = useState<string | null>(null)

  useEffect(() => {
    if (!liveStatus) {
      setAddressLabel(null)
      return
    }
    let cancelled = false
    reverseGeocodeLabel(Number(liveStatus.lat), Number(liveStatus.lng)).then((label) => {
      if (!cancelled) setAddressLabel(label)
    })
    return () => {
      cancelled = true
    }
  }, [liveStatus?.lat, liveStatus?.lng])

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
  const todaysDistanceKm = distanceTotals?.today ?? 0

  const nextInspection = getNextOccurrence(car?.weekly_checkin_day ?? null, car?.checkin_time ?? null)
  const nextPayment = getNextOccurrence(car?.weekly_checkin_day ?? null, car?.checkin_time ?? null)
  const paymentRecord = computePaymentRecord(activeRental.matched_at, driverProfile?.ontime_payments ?? null)

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.greetingRow}>
        <View>
          <Text variant="bodyMedium" style={styles.dateText}>
            {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
          <Text variant="headlineMedium" style={styles.greeting}>
            {getGreeting()}, {firstName}
          </Text>
        </View>
      </View>

      {myProfile?.role === 'both' && (
        <Button mode="outlined" onPress={() => router.push('/owner')} style={styles.switchButton}>
          Switch to Owner View
        </Button>
      )}

      <Card style={styles.rentalCard}>
        <Card.Content>
          <View style={styles.rentalCardHeader}>
            <Text variant="labelMedium" style={styles.rentalCardLabel}>
              ACTIVE RENTAL
            </Text>
            <Chip
              compact
              style={isMoving ? styles.drivingChip : styles.parkedChip}
              textStyle={styles.chipText}
            >
              {isMoving ? 'Driving' : 'Parked'}
            </Chip>
          </View>
          <View style={styles.rentalCardTitleRow}>
            <IconBadge source="car" backgroundColor="rgba(255,255,255,0.15)" />
            <Text variant="titleLarge" style={styles.rentalCardTitle}>
              {car ? `${car.make} ${car.model}` : 'Vehicle details unavailable'}
            </Text>
          </View>
          {liveStatus && (
            <>
              <View style={styles.rentalDivider} />
              <View style={styles.locationRow}>
                <Text variant="bodyMedium" style={styles.locationText}>
                  {addressLabel ?? 'Locating…'}
                </Text>
              </View>
              <Text variant="bodySmall" style={styles.sinceText}>
                {isMoving
                  ? `${Math.round(liveStatus.speed_kmh ?? 0)} km/h`
                  : `Parked ${formatElapsedSince(liveStatus.state_since)} ago`}
              </Text>
            </>
          )}
        </Card.Content>
      </Card>

      <View style={styles.statsGrid}>
        <StatTile label="Today" value={`${todaysDistanceKm.toFixed(1)} km`} icon="map-marker-distance" />
        <StatTile label="Status" value={activeTrip ? 'Driving' : 'Parked'} icon={activeTrip ? 'navigation' : 'parking'} />
      </View>

      <Text variant="labelMedium" style={styles.sectionLabel}>
        NEEDS YOUR ATTENTION
      </Text>
      {nextPayment && (
        <AlertBanner
          title="Payment due"
          subtitle={formatShortDate(nextPayment)}
          buttonLabel="View"
          icon="credit-card-clock-outline"
          onPress={() => router.push('/rental')}
        />
      )}
      {nextInspection && (
        <AlertBanner
          title="Vehicle inspection"
          subtitle={formatShortDate(nextInspection)}
          buttonLabel="Complete"
          variant="dark"
          icon="clipboard-check-outline"
          onPress={() => router.push('/rental/inspections/new')}
        />
      )}

      <Card style={styles.trustCard}>
        <Card.Content style={styles.trustCardContent}>
          <View style={styles.trustCardTextColumn}>
            <View style={styles.trustCardLabelRow}>
              <IconBadge source="shield-star" backgroundColor="rgba(255,255,255,0.15)" size={14} />
              <Text variant="labelMedium" style={styles.trustCardLabel}>
                TRUSTSCORE
              </Text>
            </View>
            <Text variant="bodyMedium" style={styles.trustCardStanding}>
              {trustScoreLabel(driverProfile?.trust_score)}
            </Text>
            {trendPoints != null && trendPoints !== 0 && (
              <View style={styles.trendRow}>
                <IconBadge
                  source={trendPoints > 0 ? 'trending-up' : 'trending-down'}
                  size={12}
                  backgroundColor={trendPoints > 0 ? brandColors.mintGreen : brandColors.errorRed}
                  color={brandColors.darkGreen}
                />
                <Text variant="bodySmall" style={styles.trendText}>
                  {trendPoints > 0 ? '+' : ''}
                  {trendPoints} points this month
                </Text>
              </View>
            )}
          </View>
          <TrustScoreRing score={driverProfile?.trust_score ?? 0} />
        </Card.Content>
      </Card>

      {paymentRecord && (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.recordHeadingRow}>
              <IconBadge source="calendar-check" backgroundColor={brandColors.green} size={14} />
              <Text variant="labelMedium" style={styles.recordHeading}>
                DRIVER RECORD
              </Text>
            </View>
            <Text variant="titleMedium" style={styles.recordValue}>
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
          </Card.Content>
        </Card>
      )}

      <Button mode="outlined" onPress={signOut} style={styles.signOutButton}>
        Sign Out
      </Button>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  greetingRow: {
    marginBottom: 16,
  },
  dateText: {
    opacity: 0.6,
  },
  greeting: {
    marginTop: 2,
  },
  switchButton: {
    marginBottom: 16,
  },
  rentalCard: {
    backgroundColor: brandColors.darkGreen,
    marginBottom: 16,
  },
  rentalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rentalCardLabel: {
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.5,
  },
  drivingChip: {
    backgroundColor: brandColors.mintGreen,
  },
  parkedChip: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  chipText: {
    color: '#fff',
  },
  rentalCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  rentalCardTitle: {
    color: '#fff',
  },
  rentalDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 12,
  },
  locationRow: {
    flexDirection: 'row',
  },
  locationText: {
    color: '#fff',
  },
  sinceText: {
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionLabel: {
    opacity: 0.6,
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 8,
  },
  trustCard: {
    backgroundColor: brandColors.darkGreen,
    marginTop: 8,
    marginBottom: 16,
  },
  trustCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trustCardTextColumn: {
    flex: 1,
    marginRight: 12,
  },
  trustCardLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trustCardLabel: {
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.5,
  },
  trustCardStanding: {
    color: brandColors.mintGreen,
    marginTop: 4,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  trendText: {
    color: 'rgba(255,255,255,0.8)',
  },
  card: {
    marginBottom: 24,
  },
  recordHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  recordHeading: {
    opacity: 0.6,
    letterSpacing: 0.5,
  },
  recordValue: {
    color: brandColors.darkGreen,
    marginBottom: 10,
  },
  recordTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EAEAE5',
    overflow: 'hidden',
  },
  recordFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: brandColors.green,
  },
  signOutButton: {
    marginTop: 16,
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
})
