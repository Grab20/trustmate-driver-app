import { View, StyleSheet, Pressable } from 'react-native'
import { Text, Card, Avatar, Icon } from 'react-native-paper'
import type { OwnerFleetEntry } from '../hooks/useOwnerFleet'
import { formatElapsedSince } from '../utils/schedule'
import { brandColors } from '../theme/theme'

export function FleetDriverCard({ entry, onPress }: { entry: OwnerFleetEntry; onPress: () => void }) {
  const isMoving = entry.liveStatus?.is_moving ?? false
  const initials = (entry.driver?.full_name ?? '?')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <View style={[styles.avatarRing, isMoving && styles.avatarRingMoving]}>
            {entry.driver?.photo_url ? (
              <Avatar.Image size={52} source={{ uri: entry.driver.photo_url }} />
            ) : (
              <Avatar.Text size={52} label={initials} />
            )}
            <View style={[styles.statusDot, isMoving ? styles.statusDotMoving : styles.statusDotParked]} />
          </View>
          <View style={styles.info}>
            <Text variant="titleMedium">{entry.driver?.full_name ?? 'Driver'}</Text>
            <View style={styles.vehicleRow}>
              <Icon source="car" size={14} color="#8A8A8A" />
              <Text variant="bodySmall" style={styles.vehicle}>
                {entry.cars ? `${entry.cars.make} ${entry.cars.model}` : 'Vehicle unavailable'}
              </Text>
            </View>
            {entry.liveStatus ? (
              <View style={styles.statusRow}>
                <Icon source={isMoving ? 'navigation' : 'map-marker'} size={14} color={isMoving ? brandColors.green : '#8A8A8A'} />
                <Text variant="bodySmall" style={[styles.since, isMoving && styles.sinceMoving]}>
                  {isMoving
                    ? `Driving${entry.liveStatus.speed_kmh != null ? ` · ${Math.round(entry.liveStatus.speed_kmh)} km/h` : ''}`
                    : `Parked · here for ${formatElapsedSince(entry.liveStatus.state_since)}`}
                </Text>
              </View>
            ) : (
              <Text variant="bodySmall" style={styles.since}>
                No location yet
              </Text>
            )}
          </View>
          <Icon source="chevron-right" size={22} color="#B8B8AE" />
        </Card.Content>
      </Card>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarRing: {
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#EAEAE5',
    padding: 2,
  },
  avatarRingMoving: {
    borderColor: brandColors.green,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  statusDotMoving: {
    backgroundColor: brandColors.green,
  },
  statusDotParked: {
    backgroundColor: '#B8B8AE',
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 4,
  },
  vehicle: {
    opacity: 0.7,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  since: {
    opacity: 0.6,
  },
  sinceMoving: {
    color: brandColors.green,
    opacity: 1,
    fontWeight: '600',
  },
})
