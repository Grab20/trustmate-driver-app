import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Card } from 'react-native-paper'
import MapView, { Marker, Polyline } from 'react-native-maps'
import { useTrip } from '../hooks/useTrip'
import { useTripWaypoints } from '../hooks/useTripWaypoints'
import { LoadingScreen } from './LoadingScreen'
import { IconBadge } from './IconBadge'
import { darkMapStyle } from '../theme/mapStyle'
import { brandColors } from '../theme/theme'

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })
}

function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ${minutes % 60}m`
}

function StatBox({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <IconBadge source={icon} size={16} backgroundColor={brandColors.green} />
      <Text variant="titleMedium" style={styles.statBoxValue}>
        {value}
      </Text>
      <Text variant="bodySmall" style={styles.statBoxLabel}>
        {label}
      </Text>
    </View>
  )
}

export function TripDetailView({ tripId }: { tripId: string | undefined }) {
  const { data: trip, isLoading: isTripLoading } = useTrip(tripId)
  const { data: waypoints, isLoading: isWaypointsLoading } = useTripWaypoints(tripId)

  if (isTripLoading || isWaypointsLoading) return <LoadingScreen />
  if (!trip) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="bodyMedium">Trip not found.</Text>
      </View>
    )
  }

  const routeCoords = (waypoints ?? []).map((w) => ({ latitude: Number(w.lat), longitude: Number(w.lng) }))
  const start = routeCoords[0]
  const end = routeCoords[routeCoords.length - 1]

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {routeCoords.length > 1 ? (
        <MapView
          style={styles.map}
          customMapStyle={darkMapStyle}
          initialRegion={{
            latitude: start.latitude,
            longitude: start.longitude,
            latitudeDelta: 0.012,
            longitudeDelta: 0.012,
          }}
        >
          <Polyline coordinates={routeCoords} strokeColor={brandColors.green} strokeWidth={4} />
          <Marker coordinate={start} title="Start" pinColor={brandColors.mintGreen} />
          <Marker coordinate={end} title="End" pinColor={brandColors.darkGreen} />
        </MapView>
      ) : (
        <View style={styles.noRoute}>
          <Text variant="bodyMedium" style={styles.noRouteText}>
            Route map not available for this trip.
          </Text>
        </View>
      )}

      <View style={styles.body}>
        <View style={styles.routeHeader}>
          <View style={styles.dots}>
            <View style={styles.outlineDot} />
            <View style={styles.line} />
            <View style={styles.filledDot} />
          </View>
          <View style={styles.routeText}>
            <Text variant="bodyMedium" style={styles.routeLabel}>
              {trip.start_location ?? 'Unknown location'}
            </Text>
            <Text variant="bodySmall" style={styles.routeTime}>
              {formatTime(trip.started_at)}
            </Text>
            <Text variant="titleMedium" style={styles.routeLabelEnd}>
              {trip.end_location ?? 'Unknown location'}
            </Text>
            {trip.ended_at && (
              <Text variant="bodySmall" style={styles.routeTime}>
                {formatTime(trip.ended_at)}
              </Text>
            )}
          </View>
        </View>

        <Card style={styles.statsCard}>
          <Card.Content style={styles.statsGrid}>
            <StatBox icon="map-marker-distance" label="Distance" value={`${(trip.distance_km ?? 0).toFixed(1)} km`} />
            <StatBox icon="timer-outline" label="Duration" value={formatDuration(trip.duration_seconds ?? 0)} />
            <StatBox icon="speedometer" label="Avg Speed" value={`${Math.round(trip.avg_speed_kmh ?? 0)} km/h`} />
            <StatBox icon="speedometer-medium" label="Max Speed" value={`${Math.round(trip.max_speed_kmh ?? 0)} km/h`} />
          </Card.Content>
        </Card>

        {(trip.odometer_start_km != null || trip.odometer_end_km != null) && (
          <Card style={styles.statsCard}>
            <Card.Content>
              <Text variant="labelMedium" style={styles.sectionLabel}>
                ODOMETER
              </Text>
              <Text variant="bodyMedium" style={styles.odometerText}>
                {trip.odometer_start_km ?? '—'} km → {trip.odometer_end_km ?? '—'} km
              </Text>
            </Card.Content>
          </Card>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  map: {
    width: '100%',
    height: 320,
  },
  noRoute: {
    width: '100%',
    height: 140,
    backgroundColor: '#EAEAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noRouteText: {
    opacity: 0.6,
  },
  body: {
    padding: 24,
  },
  routeHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dots: {
    alignItems: 'center',
    width: 20,
    marginRight: 12,
    paddingTop: 4,
  },
  outlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#B8B8AE',
  },
  line: {
    width: 1.5,
    flex: 1,
    backgroundColor: '#D6D6CC',
    marginVertical: 4,
  },
  filledDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: brandColors.darkGreen,
  },
  routeText: {
    flex: 1,
  },
  routeLabel: {
    opacity: 0.6,
  },
  routeLabelEnd: {
    marginTop: 12,
  },
  routeTime: {
    opacity: 0.6,
    marginTop: 2,
  },
  statsCard: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    marginBottom: 16,
  },
  statBoxValue: {
    marginTop: 8,
    color: brandColors.darkGreen,
  },
  statBoxLabel: {
    opacity: 0.6,
    marginTop: 2,
  },
  sectionLabel: {
    opacity: 0.6,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  odometerText: {
    color: brandColors.darkGreen,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
