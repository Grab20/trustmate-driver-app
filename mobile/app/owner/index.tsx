import { View, ScrollView, StyleSheet } from 'react-native'
import { Text, Button, Card } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { useOwnerFleet } from '../../src/hooks/useOwnerFleet'
import { useMyProfile } from '../../src/hooks/useMyProfile'
import { useAuthStore } from '../../src/stores/authStore'
import { LoadingScreen } from '../../src/components/LoadingScreen'
import { FleetDriverCard } from '../../src/components/FleetDriverCard'
import { IconBadge } from '../../src/components/IconBadge'
import { brandColors } from '../../src/theme/theme'

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
  const drivingCount = fleet?.filter((entry) => entry.liveStatus?.is_moving).length ?? 0
  const parkedCount = (fleet?.length ?? 0) - drivingCount

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.greeting}>
        {getGreeting()}, {firstName}
      </Text>

      {profile?.role === 'both' && (
        <Button mode="outlined" onPress={() => router.push('/')} style={styles.switchButton}>
          Switch to Driver View
        </Button>
      )}

      {fleet && fleet.length > 0 && (
        <Card style={styles.summaryCard}>
          <Card.Content style={styles.summaryContent}>
            <View style={styles.summaryItem}>
              <IconBadge source="navigation" backgroundColor={brandColors.green} />
              <View style={styles.summaryText}>
                <Text variant="titleMedium">{drivingCount}</Text>
                <Text variant="bodySmall" style={styles.summaryLabel}>
                  On the road
                </Text>
              </View>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <IconBadge source="map-marker" backgroundColor={brandColors.darkGreen} />
              <View style={styles.summaryText}>
                <Text variant="titleMedium">{parkedCount}</Text>
                <Text variant="bodySmall" style={styles.summaryLabel}>
                  Parked
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
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
  screen: {
    backgroundColor: brandColors.paper,
  },
  container: {
    padding: 24,
  },
  greeting: {
    marginBottom: 16,
  },
  switchButton: {
    marginBottom: 16,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  summaryText: {
    marginLeft: 12,
  },
  summaryLabel: {
    opacity: 0.6,
    marginTop: 2,
  },
  summaryDivider: {
    width: StyleSheet.hairlineWidth,
    height: 32,
    backgroundColor: '#E3E3DD',
    marginHorizontal: 12,
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
