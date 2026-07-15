import { View, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import MapView, { Marker } from 'react-native-maps'
import { IconBadge } from './IconBadge'
import { formatElapsedSince } from '../utils/schedule'
import { brandColors } from '../theme/theme'
import type { Tables } from '../types/database'

type LiveStatusMapProps = {
  liveStatus: Tables<'driver_live_status'>
  addressLabel: string | null
  height?: number
}

export function LiveStatusMap({ liveStatus, addressLabel, height = 300 }: LiveStatusMapProps) {
  const isMoving = liveStatus.is_moving ?? false
  const lat = Number(liveStatus.lat)
  const lng = Number(liveStatus.lng)

  return (
    <View style={[styles.card, { height }]}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{ latitude: lat, longitude: lng, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
        region={{ latitude: lat, longitude: lng, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
      >
        <Marker coordinate={{ latitude: lat, longitude: lng }} title={isMoving ? 'Driving' : 'Parked'}>
          <View style={[styles.pin, isMoving && styles.pinMoving]}>
            <IconBadge source={isMoving ? 'navigation' : 'car'} backgroundColor="transparent" size={16} />
          </View>
        </Marker>
      </MapView>
      <View style={styles.overlay}>
        <IconBadge
          source={isMoving ? 'navigation' : 'map-marker'}
          backgroundColor={isMoving ? brandColors.green : brandColors.darkGreen}
        />
        <View style={styles.overlayText}>
          <Text variant="bodyMedium" style={styles.overlayLocation} numberOfLines={1}>
            {addressLabel ?? 'Locating…'}
          </Text>
          <Text variant="bodySmall" style={styles.overlaySince}>
            {isMoving ? `Driving · ${Math.round(liveStatus.speed_kmh ?? 0)} km/h` : `Parked ${formatElapsedSince(liveStatus.state_since)} ago`}
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  pin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: brandColors.darkGreen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  pinMoving: {
    backgroundColor: brandColors.green,
  },
  overlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  overlayText: {
    marginLeft: 10,
    flex: 1,
  },
  overlayLocation: {
    fontWeight: '700',
  },
  overlaySince: {
    opacity: 0.6,
    marginTop: 2,
  },
})
