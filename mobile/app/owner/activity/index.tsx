import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Card } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { useOwnerFleetTrips } from '../../../src/hooks/useOwnerFleetTrips'
import { LoadingScreen } from '../../../src/components/LoadingScreen'
import { TripRouteRow } from '../../../src/components/TripRouteRow'
import { SectionLabel } from '../../../src/components/SectionLabel'

export default function OwnerActivityScreen() {
  const router = useRouter()
  const { data: trips, isLoading } = useOwnerFleetTrips()

  if (isLoading) return <LoadingScreen />

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.heading}>
        Activity
      </Text>

      <SectionLabel icon="road-variant" label="RECENT TRIPS ACROSS YOUR FLEET" />
      {trips && trips.length > 0 ? (
        <Card style={styles.tripsCard}>
          <Card.Content>
            {trips.map((trip) => (
              <TripRouteRow
                key={trip.id}
                driverName={trip.driver?.full_name ?? 'Driver'}
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
  container: {
    padding: 24,
  },
  heading: {
    marginBottom: 16,
  },
  tripsCard: {
    marginBottom: 24,
  },
  empty: {
    opacity: 0.6,
    marginBottom: 24,
  },
})
