import { View, Image, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import MapView, { Marker } from 'react-native-maps'
import { IconBadge } from './IconBadge'
import { formatElapsedSince } from '../utils/schedule'
import { darkMapStyle } from '../theme/mapStyle'
import { brandColors } from '../theme/theme'
import type { Tables } from '../types/database'

type LiveStatusMapProps = {
  liveStatus: Tables<'driver_live_status'>
  addressLabel: string | null
  height?: number
  photoUrl?: string | null
  initials?: string
}

function getInitial(initials?: string): string {
  return initials?.trim()?.[0]?.toUpperCase() ?? '?'
}

export function LiveStatusMap({ liveStatus, addressLabel, height = 300, photoUrl, initials }: LiveStatusMapProps) {
  const isMoving = liveStatus.is_moving ?? false
  const lat = Number(liveStatus.lat)
  const lng = Number(liveStatus.lng)

  return (
    <View style={[styles.card, { height }]}>
      <MapView
        style={StyleSheet.absoluteFill}
        customMapStyle={darkMapStyle}
        initialRegion={{ latitude: lat, longitude: lng, latitudeDelta: 0.006, longitudeDelta: 0.006 }}
        region={{ latitude: lat, longitude: lng, latitudeDelta: 0.006, longitudeDelta: 0.006 }}
      >
        <Marker coordinate={{ latitude: lat, longitude: lng }} title={isMoving ? 'Driving' : 'Parked'} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={styles.markerWrap}>
            <View style={[styles.avatarRing, isMoving && styles.avatarRingMoving]}>
              {photoUrl ? (
                <Image source={{ uri: photoUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarFallbackText}>{getInitial(initials)}</Text>
                </View>
              )}
            </View>
            <View style={[styles.statusBadge, isMoving ? styles.statusBadgeMoving : styles.statusBadgeParked]}>
              <IconBadge source={isMoving ? 'navigation' : 'map-marker'} backgroundColor="transparent" size={11} />
            </View>
          </View>
        </Marker>
      </MapView>
      <View style={styles.overlay}>
        <IconBadge
          source={isMoving ? 'navigation' : 'map-marker'}
          backgroundColor={isMoving ? brandColors.emerald : brandColors.teal}
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
  markerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: brandColors.teal,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarRingMoving: {
    borderColor: brandColors.emerald,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
    backgroundColor: brandColors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  statusBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  statusBadgeMoving: {
    backgroundColor: brandColors.emerald,
  },
  statusBadgeParked: {
    backgroundColor: brandColors.teal,
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
