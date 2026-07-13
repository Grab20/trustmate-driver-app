import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Card, Button, Chip } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { useActiveRental } from '../../src/hooks/useActiveRental'
import { useActiveTrip } from '../../src/hooks/useActiveTrip'
import { useTripWaypoints } from '../../src/hooks/useTripWaypoints'
import { useDistanceTotals } from '../../src/hooks/useDistanceTotals'
import { useDriverProfile } from '../../src/hooks/useDriverProfile'
import { useDriverLifetimeStats } from '../../src/hooks/useDriverLifetimeStats'
import { useMyProfile } from '../../src/hooks/useMyProfile'
import { useRecentActivity } from '../../src/hooks/useRecentActivity'
import { useAuthStore } from '../../src/stores/authStore'
import { LoadingScreen } from '../../src/components/LoadingScreen'
import { StatTile } from '../../src/components/StatTile'
import { ActivityRow } from '../../src/components/ActivityRow'
import { haversineDistanceKm } from '../../src/utils/geo'
import { getNextOccurrence, formatShortDate, getRentalWeekNumber } from '../../src/utils/schedule'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
}

export default function DashboardScreen() {
  const router = useRouter()
  const { data: activeRental, isLoading } = useActiveRental()
  const { data: activeTrip } = useActiveTrip()
  const { data: waypoints } = useTripWaypoints(activeTrip?.id)
  const { data: distanceTotals } = useDistanceTotals()
  const { data: driverProfile } = useDriverProfile()
  const { data: myProfile } = useMyProfile()
  const userId = useAuthStore((s) => s.session?.user.id)
  const { data: lifetimeStats } = useDriverLifetimeStats(userId)
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
          This app unlocks once you've been matched with a vehicle owner.
          Keep an eye on your email — once a match is confirmed on the
          TrustMate website, your rental will appear here.
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

  const liveWaypoints = (waypoints ?? []).map((w) => ({ latitude: Number(w.lat), longitude: Number(w.lng) }))
  const liveDistanceKm = liveWaypoints.reduce((total, point, index) => {
    if (index === 0) return total
    const prev = liveWaypoints[index - 1]
    return total + haversineDistanceKm(prev.latitude, prev.longitude, point.latitude, point.longitude)
  }, 0)
  const todaysDistanceKm = (distanceTotals?.today ?? 0) + (activeTrip ? liveDistanceKm : 0)
  const weekDistanceKm = (distanceTotals?.week ?? 0) + (activeTrip ? liveDistanceKm : 0)
  const monthDistanceKm = (distanceTotals?.month ?? 0) + (activeTrip ? liveDistanceKm : 0)
  const currentSpeedKmh = waypoints && waypoints.length > 0 ? Number(waypoints[waypoints.length - 1].speed_kmh ?? 0) : 0

  const nextInspection = getNextOccurrence(car?.weekly_checkin_day ?? null, car?.checkin_time ?? null)
  const nextPayment = getNextOccurrence(car?.weekly_checkin_day ?? null, car?.checkin_time ?? null)
  const rentalWeek = getRentalWeekNumber(activeRental.matched_at)

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.greeting}>
        {getGreeting()}, {firstName}
      </Text>

      {myProfile?.role === 'both' && (
        <Button mode="outlined" onPress={() => router.push('/owner')} style={styles.switchButton}>
          Switch to Owner View
        </Button>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <Chip icon="check-circle" style={styles.statusChip}>
            Active
          </Chip>
          <Text variant="titleLarge" style={styles.carTitle}>
            {car ? `${car.make} ${car.model}` : 'Vehicle details unavailable'}
          </Text>
          {activeRental.owner?.full_name && (
            <Text variant="bodyMedium" style={styles.ownerText}>
              Owner: {activeRental.owner.full_name}
            </Text>
          )}
        </Card.Content>
      </Card>

      <View style={styles.statsGrid}>
        <StatTile label="Current Status" value={activeTrip ? 'Driving' : 'Parked'} />
        <StatTile label="Current Speed" value={activeTrip ? `${currentSpeedKmh.toFixed(0)} km/h` : '—'} />
        <StatTile label="Today's Distance" value={`${todaysDistanceKm.toFixed(1)} km`} />
        <StatTile label="This Week" value={`${weekDistanceKm.toFixed(1)} km`} />
        <StatTile label="This Month" value={`${monthDistanceKm.toFixed(1)} km`} />
        <StatTile label="Rental Week" value={rentalWeek != null ? `Week ${rentalWeek}` : '—'} />
        <StatTile
          label="Next Payment"
          value={nextPayment ? formatShortDate(nextPayment) : 'Not scheduled'}
        />
        <StatTile
          label="Next Inspection"
          value={nextInspection ? formatShortDate(nextInspection) : 'Not scheduled'}
        />
        <StatTile
          label="TrustScore"
          value={driverProfile?.trust_score != null ? String(driverProfile.trust_score) : '—'}
        />
        <StatTile
          label="Next Service"
          value={car?.next_service_date ? formatShortDate(new Date(car.next_service_date)) : 'Not scheduled'}
        />
      </View>

      <Text variant="titleMedium" style={styles.activityHeading}>
        Lifetime Stats
      </Text>
      <View style={styles.statsGrid}>
        <StatTile label="Total Trips" value={String(lifetimeStats?.totalTrips ?? 0)} />
        <StatTile label="Total Distance" value={`${(lifetimeStats?.totalDistanceKm ?? 0).toFixed(0)} km`} />
        <StatTile label="Top Speed" value={`${(lifetimeStats?.topSpeedKmh ?? 0).toFixed(0)} km/h`} />
      </View>

      <Button
        mode="contained-tonal"
        icon="clipboard-check-outline"
        onPress={() => router.push('/inspections')}
        style={styles.actionButton}
      >
        Inspections & Payments
      </Button>

      <Button
        mode="contained-tonal"
        icon="alert-circle-outline"
        onPress={() => router.push('/traffic-offences')}
        style={styles.actionButton}
      >
        Traffic Offences
      </Button>

      <Text variant="titleMedium" style={styles.activityHeading}>
        Recent Activity
      </Text>
      {recentActivity && recentActivity.length > 0 ? (
        recentActivity.map((item) => <ActivityRow key={`${item.type}-${item.id}`} item={item} />)
      ) : (
        <Text variant="bodyMedium" style={styles.noActivity}>
          Nothing yet — trips and submissions will show up here.
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
  ownerText: {
    opacity: 0.7,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    marginBottom: 24,
  },
  activityHeading: {
    marginBottom: 8,
  },
  noActivity: {
    opacity: 0.6,
    marginBottom: 24,
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
