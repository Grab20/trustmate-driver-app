import { View, StyleSheet, Pressable } from 'react-native'
import { Text, Card, Avatar, Chip } from 'react-native-paper'
import type { OwnerFleetEntry } from '../hooks/useOwnerFleet'
import { formatElapsedSince } from '../utils/schedule'

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
          {entry.driver?.photo_url ? (
            <Avatar.Image size={56} source={{ uri: entry.driver.photo_url }} />
          ) : (
            <Avatar.Text size={56} label={initials} />
          )}
          <View style={styles.info}>
            <Text variant="titleMedium">{entry.driver?.full_name ?? 'Driver'}</Text>
            <Text variant="bodySmall" style={styles.vehicle}>
              {entry.cars ? `${entry.cars.make} ${entry.cars.model}` : 'Vehicle unavailable'}
            </Text>
            {entry.liveStatus ? (
              <Text variant="bodySmall" style={styles.since}>
                {isMoving
                  ? `Driving${entry.liveStatus.speed_kmh != null ? ` · ${Math.round(entry.liveStatus.speed_kmh)} km/h` : ''}`
                  : `Parked · here for ${formatElapsedSince(entry.liveStatus.state_since)}`}
              </Text>
            ) : (
              <Text variant="bodySmall" style={styles.since}>
                No location yet
              </Text>
            )}
          </View>
          <Chip
            compact
            style={isMoving ? styles.drivingChip : styles.parkedChip}
            textStyle={isMoving ? styles.drivingChipText : styles.parkedChipText}
          >
            {isMoving ? 'Driving' : 'Parked'}
          </Chip>
        </Card.Content>
      </Card>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  vehicle: {
    opacity: 0.7,
    marginTop: 2,
  },
  since: {
    opacity: 0.6,
    marginTop: 4,
  },
  drivingChip: {
    backgroundColor: '#DFF5E6',
  },
  drivingChipText: {
    color: '#1E7A3D',
  },
  parkedChip: {
    backgroundColor: '#EEE',
  },
  parkedChipText: {
    color: '#555',
  },
})
