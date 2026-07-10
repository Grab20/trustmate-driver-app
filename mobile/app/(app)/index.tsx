import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Card, Button, Chip } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { useActiveRental } from '../../src/hooks/useActiveRental'
import { useAuthStore } from '../../src/stores/authStore'
import { LoadingScreen } from '../../src/components/LoadingScreen'

export default function DashboardScreen() {
  const router = useRouter()
  const { data: activeRental, isLoading } = useActiveRental()
  const signOut = useAuthStore((s) => s.signOut)

  if (isLoading) return <LoadingScreen />

  if (!activeRental) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="headlineSmall" style={styles.emptyTitle}>
          No Active Rental Yet
        </Text>
        <Text variant="bodyMedium" style={styles.emptyBody}>
          This app unlocks once you've been matched with a vehicle owner.
          Keep an eye on your email — once a match is confirmed on the
          TrustMate website, your rental will appear here.
        </Text>
        <Button mode="outlined" onPress={signOut} style={styles.signOutButton}>
          Sign Out
        </Button>
      </View>
    )
  }

  const car = activeRental.cars

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.heading}>
        Your Active Rental
      </Text>

      <Card style={styles.card}>
        <Card.Content>
          <Chip icon="check-circle" style={styles.statusChip}>
            Matched
          </Chip>
          <Text variant="titleLarge" style={styles.carTitle}>
            {car ? `${car.make} ${car.model} (${car.year})` : 'Vehicle details unavailable'}
          </Text>
          {car?.location && (
            <Text variant="bodyMedium" style={styles.carDetail}>
              {car.location}
            </Text>
          )}
          {car?.color && (
            <Text variant="bodyMedium" style={styles.carDetail}>
              {car.color} · {car.transmission}
            </Text>
          )}
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        icon="map-marker-path"
        onPress={() => router.push('/trip')}
        style={styles.actionButton}
      >
        Trip Status
      </Button>
      <Button
        mode="contained-tonal"
        icon="clipboard-check-outline"
        onPress={() => router.push('/inspections')}
        style={styles.actionButton}
      >
        Weekly Check-In
      </Button>

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
  heading: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 24,
  },
  statusChip: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  carTitle: {
    marginBottom: 4,
  },
  carDetail: {
    opacity: 0.7,
  },
  actionButton: {
    marginBottom: 12,
  },
  signOutButton: {
    marginTop: 8,
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
