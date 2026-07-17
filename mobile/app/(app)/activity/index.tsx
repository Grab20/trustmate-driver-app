import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Card } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { useDistanceTotals } from '../../../src/hooks/useDistanceTotals'
import { useTodayTrips } from '../../../src/hooks/useTodayTrips'
import { useRecentActivity } from '../../../src/hooks/useRecentActivity'
import { LoadingScreen } from '../../../src/components/LoadingScreen'
import { TripRouteRow } from '../../../src/components/TripRouteRow'
import { ActivityRow } from '../../../src/components/ActivityRow'
import { brandColors, radius, cardShadow } from '../../../src/theme/theme'

function formatDrivingTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.round((seconds % 3600) / 60)
  if (hours === 0) return `${minutes}m`
  return `${hours}h${minutes.toString().padStart(2, '0')}m`
}

export default function ActivityScreen() {
  const router = useRouter()
  const { data: distanceTotals, isLoading: isTotalsLoading } = useDistanceTotals()
  const { data: todayTrips, isLoading: isTripsLoading } = useTodayTrips()
  const { data: recentActivity, isLoading: isRecentLoading } = useRecentActivity()

  if (isTotalsLoading || isTripsLoading || isRecentLoading) return <LoadingScreen />

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.statsRow}>
        <View style={[styles.card, styles.statCard]}>
          <Text style={styles.statLabel}>TODAY</Text>
          <Text style={styles.statValue}>{(distanceTotals?.today ?? 0).toFixed(0)} km</Text>
          <Text style={styles.statSub}>{formatDrivingTime(distanceTotals?.durationTodaySeconds ?? 0)} driving</Text>
        </View>
        <View style={[styles.card, styles.statCard]}>
          <Text style={styles.statLabel}>THIS WEEK</Text>
          <Text style={styles.statValue}>{(distanceTotals?.week ?? 0).toFixed(0)} km</Text>
          <Text style={styles.statSub}>{formatDrivingTime(distanceTotals?.durationWeekSeconds ?? 0)} driving</Text>
        </View>
      </View>

      <Text variant="labelMedium" style={styles.sectionLabel}>
        TODAY'S TRIPS
      </Text>
      {todayTrips && todayTrips.length > 0 ? (
        <Card style={styles.tripsCard}>
          <Card.Content>
            {todayTrips.map((trip, index) => (
              <TripRouteRow
                key={trip.id}
                tripNumber={index + 1}
                startLabel={trip.start_location ?? 'Unknown location'}
                endLabel={trip.end_location ?? 'Unknown location'}
                startTime={trip.started_at}
                distanceKm={trip.distance_km ?? 0}
                durationSeconds={trip.duration_seconds ?? 0}
                maxSpeedKmh={trip.max_speed_kmh ?? 0}
                onPress={() => router.push(`/activity/${trip.id}`)}
              />
            ))}
          </Card.Content>
        </Card>
      ) : (
        <Text variant="bodyMedium" style={styles.noTrips}>
          No trips recorded yet today.
        </Text>
      )}

      <Text variant="labelMedium" style={styles.sectionLabel}>
        RECENT ACTIVITY
      </Text>
      {recentActivity && recentActivity.length > 0 ? (
        <Card style={styles.tripsCard}>
          <Card.Content>
            {recentActivity.map((item) => (
              <ActivityRow
                key={`${item.type}-${item.id}`}
                item={item}
                onPress={item.type === 'trip' ? () => router.push(`/activity/${item.trip.id}`) : undefined}
              />
            ))}
          </Card.Content>
        </Card>
      ) : (
        <Text variant="bodyMedium" style={styles.noTrips}>
          Nothing yet — trips and submissions will show up here.
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
    marginBottom: 8,
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
    marginBottom: 8,
  },
  tripsCard: {
    marginBottom: 24,
  },
  noTrips: {
    opacity: 0.6,
    marginBottom: 24,
  },
})
