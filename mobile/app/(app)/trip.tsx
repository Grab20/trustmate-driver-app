import { useEffect, useState } from 'react'
import { View, StyleSheet, Linking } from 'react-native'
import { Text, Card, Button, ActivityIndicator, Chip } from 'react-native-paper'
import MapView, { Marker, Polyline } from 'react-native-maps'
import { useActiveRental } from '../../src/hooks/useActiveRental'
import { useActiveTrip } from '../../src/hooks/useActiveTrip'
import { useTripWaypoints } from '../../src/hooks/useTripWaypoints'
import { useAutoTripTracking } from '../../src/hooks/useAutoTripTracking'
import { formatDuration, haversineDistanceKm } from '../../src/utils/geo'
import { LoadingScreen } from '../../src/components/LoadingScreen'

export default function TripScreen() {
  const { data: activeRental, isLoading: isRentalLoading } = useActiveRental()
  const { data: activeTrip, isLoading: isTripLoading } = useActiveTrip()
  const { data: waypoints } = useTripWaypoints(activeTrip?.id)
  const permissionStatus = useAutoTripTracking()

  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    if (!activeTrip) {
      setElapsedSeconds(0)
      return
    }
    const startedAt = new Date(activeTrip.started_at).getTime()
    const tick = () => setElapsedSeconds((Date.now() - startedAt) / 1000)
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [activeTrip])

  if (isRentalLoading || isTripLoading) return <LoadingScreen />

  if (!activeRental || !activeRental.car_id) {
    return (
      <View style={styles.centered}>
        <Text variant="bodyMedium" style={{ textAlign: 'center', opacity: 0.7 }}>
          Trip tracking is available once you have an active rental.
        </Text>
      </View>
    )
  }

  if (permissionStatus === 'denied') {
    return (
      <View style={styles.centered}>
        <Text variant="headlineSmall" style={{ marginBottom: 12, textAlign: 'center' }}>
          Location Permission Needed
        </Text>
        <Text variant="bodyMedium" style={{ textAlign: 'center', opacity: 0.7, marginBottom: 24 }}>
          TrustMate Driver detects your trips automatically, but needs "Allow all the time" location
          access to do it in the background. Please enable this in your device settings.
        </Text>
        <Button mode="contained" onPress={() => Linking.openSettings()}>
          Open Settings
        </Button>
      </View>
    )
  }

  const waypointPoints = (waypoints ?? []).map((w) => ({
    latitude: Number(w.lat),
    longitude: Number(w.lng),
  }))
  const lastWaypoint = waypointPoints[waypointPoints.length - 1]
  const currentSpeedKmh = waypoints && waypoints.length > 0 ? Number(waypoints[waypoints.length - 1].speed_kmh ?? 0) : 0
  const liveDistanceKm = waypointPoints.reduce((total, point, index) => {
    if (index === 0) return total
    const prev = waypointPoints[index - 1]
    return total + haversineDistanceKm(prev.latitude, prev.longitude, point.latitude, point.longitude)
  }, 0)

  if (!activeTrip) {
    return (
      <View style={styles.centered}>
        <Chip icon="radar" style={styles.watchingChip}>
          Watching for driving activity
        </Chip>
        <Text variant="headlineSmall" style={{ marginTop: 16, marginBottom: 12, textAlign: 'center' }}>
          No Active Trip
        </Text>
        <Text variant="bodyMedium" style={{ textAlign: 'center', opacity: 0.7 }}>
          Trips start automatically once you begin driving, and end automatically once you've been
          stopped for a few minutes. Nothing to press — just drive.
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.flex}>
      {lastWaypoint ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: lastWaypoint.latitude,
            longitude: lastWaypoint.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          region={{
            latitude: lastWaypoint.latitude,
            longitude: lastWaypoint.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Polyline coordinates={waypointPoints} strokeWidth={4} />
          <Marker coordinate={lastWaypoint} title="Current position" />
        </MapView>
      ) : (
        <View style={[styles.map, styles.mapPlaceholder]}>
          <ActivityIndicator />
          <Text variant="bodySmall" style={{ marginTop: 8, opacity: 0.7 }}>
            Waiting for GPS signal…
          </Text>
        </View>
      )}

      <Card style={styles.statsCard}>
        <Card.Content>
          <Chip icon="car" style={styles.drivingChip}>
            Trip in progress
          </Chip>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text variant="labelMedium" style={styles.statLabel}>
                Duration
              </Text>
              <Text variant="titleMedium">{formatDuration(elapsedSeconds)}</Text>
            </View>
            <View style={styles.stat}>
              <Text variant="labelMedium" style={styles.statLabel}>
                Distance
              </Text>
              <Text variant="titleMedium">{liveDistanceKm.toFixed(1)} km</Text>
            </View>
            <View style={styles.stat}>
              <Text variant="labelMedium" style={styles.statLabel}>
                Speed
              </Text>
              <Text variant="titleMedium">{currentSpeedKmh.toFixed(0)} km/h</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </View>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  watchingChip: {
    alignSelf: 'center',
  },
  drivingChip: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCard: {
    margin: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    opacity: 0.6,
    marginBottom: 4,
  },
})
