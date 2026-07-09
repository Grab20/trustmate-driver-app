import { useEffect, useState } from 'react'
import { View, StyleSheet, Alert } from 'react-native'
import { Text, Button, Card, ActivityIndicator } from 'react-native-paper'
import MapView, { Marker, Polyline } from 'react-native-maps'
import * as Location from 'expo-location'
import { useActiveRental } from '../../src/hooks/useActiveRental'
import { useActiveTrip } from '../../src/hooks/useActiveTrip'
import { useVehicleOdometer } from '../../src/hooks/useVehicleOdometer'
import { useStartTrip, useEndTrip } from '../../src/hooks/useTripMutations'
import { useTripLocationTracking } from '../../src/hooks/useTripLocationTracking'
import { OdometerDialog } from '../../src/components/OdometerDialog'
import { formatDuration } from '../../src/utils/geo'
import { LoadingScreen } from '../../src/components/LoadingScreen'

async function getCurrentLocationLabel(): Promise<string | null> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync()
    if (status !== 'granted') return null
    const position = await Location.getCurrentPositionAsync({})
    return `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`
  } catch {
    return null
  }
}

export default function TripScreen() {
  const { data: activeRental, isLoading: isRentalLoading } = useActiveRental()
  const { data: activeTrip, isLoading: isTripLoading } = useActiveTrip()
  const { data: odometer } = useVehicleOdometer(activeRental?.car_id ?? undefined)
  const startTrip = useStartTrip()
  const endTrip = useEndTrip()
  const tracking = useTripLocationTracking(activeTrip?.id ?? null)

  const [showStartDialog, setShowStartDialog] = useState(false)
  const [showEndDialog, setShowEndDialog] = useState(false)
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

  async function handleStartTrip(odometerKm: number) {
    setShowStartDialog(false)
    const locationLabel = await getCurrentLocationLabel()
    try {
      await startTrip.mutateAsync({
        carId: activeRental!.car_id as string,
        applicationId: activeRental!.id,
        odometerStartKm: odometerKm,
        startLocation: locationLabel,
      })
    } catch (err) {
      Alert.alert('Could not start trip', err instanceof Error ? err.message : 'Unknown error')
    }
  }

  async function handleEndTrip(odometerKm: number) {
    setShowEndDialog(false)
    if (!activeTrip) return
    const locationLabel = await getCurrentLocationLabel()
    const durationSeconds = (Date.now() - new Date(activeTrip.started_at).getTime()) / 1000
    const distanceKm =
      activeTrip.odometer_start_km != null
        ? Math.max(0, odometerKm - activeTrip.odometer_start_km)
        : tracking.distanceKm

    try {
      await endTrip.mutateAsync({
        tripId: activeTrip.id,
        carId: activeRental!.car_id as string,
        durationSeconds,
        distanceKm,
        avgSpeedKmh: durationSeconds > 0 ? distanceKm / (durationSeconds / 3600) : null,
        maxSpeedKmh: tracking.maxSpeedKmh || null,
        odometerEndKm: odometerKm,
        endLocation: locationLabel,
      })
      tracking.reset()
    } catch (err) {
      Alert.alert('Could not end trip', err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const lastWaypoint = tracking.waypoints[tracking.waypoints.length - 1]

  return (
    <View style={styles.container}>
      {!activeTrip ? (
        <View style={styles.centered}>
          <Text variant="headlineSmall" style={{ marginBottom: 12 }}>
            No Active Trip
          </Text>
          <Text variant="bodyMedium" style={{ textAlign: 'center', opacity: 0.7, marginBottom: 24 }}>
            Start a trip to track your route, distance, and odometer while you're driving.
          </Text>
          <Button
            mode="contained"
            onPress={() => setShowStartDialog(true)}
            loading={startTrip.isPending}
            disabled={startTrip.isPending}
          >
            Start Trip
          </Button>
        </View>
      ) : (
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
              <Polyline coordinates={tracking.waypoints} strokeWidth={4} />
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
                  <Text variant="titleMedium">{tracking.distanceKm.toFixed(1)} km</Text>
                </View>
                <View style={styles.stat}>
                  <Text variant="labelMedium" style={styles.statLabel}>
                    Speed
                  </Text>
                  <Text variant="titleMedium">{tracking.currentSpeedKmh.toFixed(0)} km/h</Text>
                </View>
              </View>
              {tracking.permissionDenied && (
                <Text variant="bodySmall" style={styles.permissionWarning}>
                  Location permission denied — enable it in Settings to track your route.
                </Text>
              )}
              <Button
                mode="contained"
                onPress={() => setShowEndDialog(true)}
                loading={endTrip.isPending}
                disabled={endTrip.isPending}
                style={styles.endButton}
              >
                End Trip
              </Button>
            </Card.Content>
          </Card>
        </View>
      )}

      <OdometerDialog
        visible={showStartDialog}
        title="Start Trip"
        initialValue={odometer?.current_km ?? null}
        onDismiss={() => setShowStartDialog(false)}
        onConfirm={handleStartTrip}
        confirmLabel="Start"
      />
      <OdometerDialog
        visible={showEndDialog}
        title="End Trip"
        initialValue={activeTrip?.odometer_start_km ?? odometer?.current_km ?? null}
        onDismiss={() => setShowEndDialog(false)}
        onConfirm={handleEndTrip}
        confirmLabel="End"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
    marginBottom: 12,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    opacity: 0.6,
    marginBottom: 4,
  },
  permissionWarning: {
    color: '#B3261E',
    marginBottom: 12,
  },
  endButton: {
    marginTop: 4,
  },
})
