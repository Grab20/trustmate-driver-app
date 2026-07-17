import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Card } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { useOwnerFleetTrips } from '../../../src/hooks/useOwnerFleetTrips'
import { useOwnerFleetDistanceTotals } from '../../../src/hooks/useOwnerFleetDistanceTotals'
import { LoadingScreen } from '../../../src/components/LoadingScreen'
import { TripRouteRow } from '../../../src/components/TripRouteRow'
import { SectionLabel } from '../../../src/components/SectionLabel'
import { brandColors, radius, cardShadow } from '../../../src/theme/theme'

function formatDrivingTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.round((seconds % 3600) / 60)
  if (hours === 0) return `${minutes}m`
  return `${hours}h${minutes.toString().padStart(2, '0')}m`
}

export default function OwnerActivityScreen() {
  const router = useRouter()
  const { data: trips, isLoading: isTripsLoading } = useOwnerFleetTrips()
  const { data: totals, isLoading: isTotalsLoading } = useOwnerFleetDistanceTotals()

  if (isTripsLoading || isTotalsLoading) return <LoadingScreen />

  const perDriver = totals?.perDriver ?? []
  const showPerDriver = perDriver.length > 1

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.statsRow}>
        <View style={[styles.card, styles.statCard]}>
          <Text style={styles.statLabel}>TODAY</Text>
          <Text style={styles.statValue}>{(totals?.today ?? 0).toFixed(0)} km</Text>
          <Text style={styles.statSub}>{formatDrivingTime(totals?.durationTodaySeconds ?? 0)} driving</Text>
        </View>
        <View style={[styles.card, styles.statCard]}>
          <Text style={styles.statLabel}>THIS WEEK</Text>
          <Text style={styles.statValue}>{(totals?.week ?? 0).toFixed(0)} km</Text>
          <Text style={styles.statSub}>{formatDrivingTime(totals?.durationWeekSeconds ?? 0)} driving</Text>
        </View>
      </View>
      <View style={[styles.card, styles.monthCard]}>
        <Text style={styles.statLabel}>THIS MONTH</Text>
        <Text style={styles.statValue}>{(totals?.month ?? 0).toFixed(0)} km</Text>
      </View>

      {showPerDriver && (
        <>
          <Text variant="labelMedium" style={styles.sectionLabel}>
            BY DRIVER THIS WEEK
          </Text>
          <View style={styles.card}>
            {perDriver.map((driver, index) => (
              <View
                key={driver.driverId}
                style={[styles.driverRow, index === perDriver.length - 1 && styles.driverRowLast]}
              >
                <Text style={styles.driverName}>{driver.driverName}</Text>
                <Text style={styles.driverKm}>{driver.week.toFixed(0)} km</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <SectionLabel icon="road-variant" label="RECENT TRIPS ACROSS YOUR FLEET" />
      {trips && trips.length > 0 ? (
        <Card style={styles.tripsCard}>
          <Card.Content>
            {trips.map((trip, index) => (
              <TripRouteRow
                key={trip.id}
                tripNumber={index + 1}
                startLabel={trip.start_location ?? 'Unknown location'}
                endLabel={trip.end_location ?? 'Unknown location'}
                startTime={trip.started_at}
                distanceKm={trip.distance_km ?? 0}
                durationSeconds={trip.duration_seconds ?? 0}
                maxSpeedKmh={trip.max_speed_kmh ?? 0}
                onPress={() => router.push(`/owner/driver/trip/${trip.id}`)}
              />
            ))}
          </Card.Content>
        </Card>
      ) : (
        <Text variant="bodyMedium" style={styles.empty}>
          No trips recorded yet.
        </Text>
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  card: {
    backgroundColor: brandColors.cardGreen,
    borderRadius: radius.lg,
    padding: 16,
    ...cardShadow,
  },
  statCard: {
    flex: 1,
  },
  monthCard: {
    marginBottom: 8,
  },
  statLabel: {
    color: brandColors.inkOnCardSoft,
    fontSize: 12,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  statValue: {
    color: brandColors.inkOnCard,
    fontSize: 22,
    fontWeight: '700',
  },
  statSub: {
    color: brandColors.inkOnCardSoft,
    marginTop: 4,
  },
  sectionLabel: {
    color: brandColors.charcoalSoft,
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 12,
  },
  driverRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  driverRowLast: {
    paddingBottom: 0,
    marginBottom: 0,
    borderBottomWidth: 0,
  },
  driverName: {
    color: brandColors.inkOnCard,
    fontWeight: '600',
  },
  driverKm: {
    color: brandColors.gold,
    fontWeight: '700',
  },
  tripsCard: {
    marginBottom: 24,
  },
  empty: {
    opacity: 0.6,
    marginBottom: 24,
  },
})
