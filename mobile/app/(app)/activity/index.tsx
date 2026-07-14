import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Card } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { useDistanceTotals } from '../../../src/hooks/useDistanceTotals'
import { useTodayTrips } from '../../../src/hooks/useTodayTrips'
import { LoadingScreen } from '../../../src/components/LoadingScreen'
import { TripRouteRow } from '../../../src/components/TripRouteRow'
import { IconBadge } from '../../../src/components/IconBadge'
import { brandColors } from '../../../src/theme/theme'

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

  if (isTotalsLoading || isTripsLoading) return <LoadingScreen />

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.heading}>
        Activity
      </Text>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Card.Content>
            <IconBadge source="map-marker-distance" backgroundColor={brandColors.green} />
            <Text variant="labelMedium" style={styles.statLabel}>
              TODAY
            </Text>
            <Text variant="titleLarge" style={styles.statValue}>
              {(distanceTotals?.today ?? 0).toFixed(0)} km
            </Text>
            <Text variant="bodySmall" style={styles.statSub}>
              {formatDrivingTime(distanceTotals?.durationTodaySeconds ?? 0)} driving
            </Text>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content>
            <IconBadge source="calendar-week" backgroundColor={brandColors.darkGreen} />
            <Text variant="labelMedium" style={styles.statLabel}>
              THIS WEEK
            </Text>
            <Text variant="titleLarge" style={styles.statValue}>
              {(distanceTotals?.week ?? 0).toFixed(0)} km
            </Text>
            <Text variant="bodySmall" style={styles.statSub}>
              {formatDrivingTime(distanceTotals?.durationWeekSeconds ?? 0)} driving
            </Text>
          </Card.Content>
        </Card>
      </View>

      <Text variant="labelMedium" style={styles.sectionLabel}>
        TODAY'S TRIPS
      </Text>
      {todayTrips && todayTrips.length > 0 ? (
        <Card style={styles.tripsCard}>
          <Card.Content>
            {todayTrips.map((trip) => (
              <TripRouteRow
                key={trip.id}
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
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  heading: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
  },
  statLabel: {
    opacity: 0.6,
    letterSpacing: 0.5,
    marginTop: 8,
  },
  statValue: {
    marginTop: 4,
    color: brandColors.darkGreen,
  },
  statSub: {
    opacity: 0.6,
    marginTop: 2,
  },
  sectionLabel: {
    opacity: 0.6,
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
