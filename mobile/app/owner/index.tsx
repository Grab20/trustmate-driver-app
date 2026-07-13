import { ScrollView, StyleSheet } from 'react-native'
import { Text, Button } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { useOwnerFleet } from '../../src/hooks/useOwnerFleet'
import { useMyProfile } from '../../src/hooks/useMyProfile'
import { useAuthStore } from '../../src/stores/authStore'
import { LoadingScreen } from '../../src/components/LoadingScreen'
import { FleetDriverCard } from '../../src/components/FleetDriverCard'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
}

export default function OwnerDashboardScreen() {
  const router = useRouter()
  const { data: fleet, isLoading } = useOwnerFleet()
  const { data: profile } = useMyProfile()
  const signOut = useAuthStore((s) => s.signOut)

  if (isLoading) return <LoadingScreen />

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.greeting}>
        {getGreeting()}, {firstName}
      </Text>

      {profile?.role === 'both' && (
        <Button mode="outlined" onPress={() => router.push('/')} style={styles.switchButton}>
          Switch to Driver View
        </Button>
      )}

      {fleet && fleet.length > 0 ? (
        fleet.map((entry) => (
          <FleetDriverCard
            key={entry.id}
            entry={entry}
            onPress={() =>
              router.push({
                pathname: '/owner/driver/[id]',
                params: { id: entry.driver_id ?? '', carId: entry.car_id ?? '' },
              })
            }
          />
        ))
      ) : (
        <Text variant="bodyMedium" style={styles.empty}>
          No matched drivers yet. Once a driver is matched to one of your vehicles on the
          TrustMate website, they'll appear here.
        </Text>
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
  greeting: {
    marginBottom: 16,
  },
  switchButton: {
    marginBottom: 16,
  },
  empty: {
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  signOutButton: {
    marginTop: 16,
  },
})
