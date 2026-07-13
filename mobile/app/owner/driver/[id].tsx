import { useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { ScrollView, View, StyleSheet } from 'react-native'
import { Text, Card } from 'react-native-paper'
import MapView, { Marker } from 'react-native-maps'
import { useDriverLiveStatus } from '../../../src/hooks/useDriverLiveStatus'
import { useDriverTripHistory } from '../../../src/hooks/useDriverTripHistory'
import { useDriverInspectionsForOwner } from '../../../src/hooks/useInspections'
import { LoadingScreen } from '../../../src/components/LoadingScreen'
import { InspectionPhotoThumbnail } from '../../../src/components/InspectionPhotoThumbnail'
import { StatTile } from '../../../src/components/StatTile'
import { formatElapsedSince } from '../../../src/utils/schedule'
import { reverseGeocodeLabel } from '../../../src/lib/reverseGeocode'

const TYPE_LABELS: Record<string, string> = {
  weekly_checkin: 'Vehicle Inspection',
  proof_of_payment: 'Proof of Payment',
  incident_report: 'Incident Report',
}

export default function OwnerDriverDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: liveStatus, isLoading: isLiveStatusLoading } = useDriverLiveStatus(id)
  const { data: trips } = useDriverTripHistory(id)
  const { data: inspections } = useDriverInspectionsForOwner(id)
  const [addressLabel, setAddressLabel] = useState<string | null>(null)

  useEffect(() => {
    if (!liveStatus) {
      setAddressLabel(null)
      return
    }
    let cancelled = false
    reverseGeocodeLabel(Number(liveStatus.lat), Number(liveStatus.lng)).then((label) => {
      if (!cancelled) setAddressLabel(label)
    })
    return () => {
      cancelled = true
    }
  }, [liveStatus?.lat, liveStatus?.lng])

  if (isLiveStatusLoading) return <LoadingScreen />

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {liveStatus ? (
        <>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: Number(liveStatus.lat),
              longitude: Number(liveStatus.lng),
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            region={{
              latitude: Number(liveStatus.lat),
              longitude: Number(liveStatus.lng),
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{ latitude: Number(liveStatus.lat), longitude: Number(liveStatus.lng) }}
              title={liveStatus.is_moving ? 'Driving' : 'Parked'}
            />
          </MapView>

          <Card style={styles.statusCard}>
            <Card.Content>
              <Text variant="titleMedium">{liveStatus.is_moving ? 'Driving' : 'Parked'}</Text>
              <Text variant="bodyMedium" style={styles.address}>
                {addressLabel ?? 'Locating…'}
              </Text>
              <Text variant="bodySmall" style={styles.since}>
                {liveStatus.is_moving
                  ? `${Math.round(liveStatus.speed_kmh ?? 0)} km/h`
                  : `Here for ${formatElapsedSince(liveStatus.state_since)}`}
              </Text>
            </Card.Content>
          </Card>
        </>
      ) : (
        <Text variant="bodyMedium" style={styles.noLocation}>
          No location data yet for this driver.
        </Text>
      )}

      <Text variant="titleMedium" style={styles.sectionHeading}>
        Recent Trips
      </Text>
      {trips && trips.length > 0 ? (
        trips.map((trip) => (
          <Card key={trip.id} style={styles.tripCard}>
            <Card.Content>
              <Text variant="bodyMedium">
                {trip.start_location ?? 'Unknown'} → {trip.end_location ?? 'Unknown'}
              </Text>
              <View style={styles.tripStatsRow}>
                <StatTile label="Distance" value={`${(trip.distance_km ?? 0).toFixed(1)} km`} />
                <StatTile label="Avg Speed" value={`${Math.round(trip.avg_speed_kmh ?? 0)} km/h`} />
                <StatTile label="Max Speed" value={`${Math.round(trip.max_speed_kmh ?? 0)} km/h`} />
              </View>
              <Text variant="bodySmall" style={styles.tripDate}>
                {new Date(trip.started_at).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </Card.Content>
          </Card>
        ))
      ) : (
        <Text variant="bodyMedium" style={styles.empty}>
          No completed trips yet.
        </Text>
      )}

      <Text variant="titleMedium" style={styles.sectionHeading}>
        Inspections
      </Text>
      {inspections && inspections.length > 0 ? (
        inspections.map((inspection) => (
          <Card key={inspection.id} style={styles.tripCard}>
            <Card.Content>
              <Text variant="bodyMedium">
                {TYPE_LABELS[inspection.inspection_type] ?? inspection.inspection_type}
              </Text>
              <Text variant="bodySmall" style={styles.tripDate}>
                {new Date(inspection.created_at ?? '').toLocaleDateString()}
              </Text>
              <View style={styles.photoRow}>
                {(inspection.photo_urls ?? []).map((path) => (
                  <InspectionPhotoThumbnail key={path} path={path} />
                ))}
              </View>
            </Card.Content>
          </Card>
        ))
      ) : (
        <Text variant="bodyMedium" style={styles.empty}>
          No inspections submitted yet.
        </Text>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  map: {
    width: '100%',
    height: 220,
  },
  statusCard: {
    margin: 16,
  },
  address: {
    marginTop: 4,
  },
  since: {
    opacity: 0.6,
    marginTop: 4,
  },
  noLocation: {
    margin: 24,
    textAlign: 'center',
    opacity: 0.6,
  },
  sectionHeading: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  tripCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  tripStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  tripDate: {
    opacity: 0.6,
    marginTop: 4,
  },
  photoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  empty: {
    marginHorizontal: 16,
    opacity: 0.6,
    marginBottom: 24,
  },
})
