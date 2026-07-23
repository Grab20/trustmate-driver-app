import { View, StyleSheet, Pressable } from 'react-native'
import { Text, IconButton } from 'react-native-paper'
import Svg, { Path, Ellipse, Rect } from 'react-native-svg'
import { EXTERIOR_SHOT_KEYS, type InspectionShotKey } from './InspectionShotGuide'
import { brandColors } from '../theme/theme'

type MarkerSpec = {
  key: InspectionShotKey
  left: `${number}%`
  top: `${number}%`
}

// Positions are tuned against the car silhouette below (nose at top), one
// marker per exterior shot so a driver can see exactly which angle is left —
// most drivers are more used to reading a picture of the car than a label.
const MARKERS: MarkerSpec[] = [
  { key: 'front', left: '50%', top: '4%' },
  { key: 'front_driver_side', left: '18%', top: '22%' },
  { key: 'back_driver_side', left: '18%', top: '78%' },
  { key: 'front_passenger_side', left: '82%', top: '22%' },
  { key: 'back_passenger_side', left: '82%', top: '78%' },
  { key: 'rear', left: '50%', top: '95%' },
]

export function InspectionCarDiagram({
  capturedKeys,
  onPressShot,
}: {
  capturedKeys: Set<InspectionShotKey>
  onPressShot: (key: InspectionShotKey) => void
}) {
  const bootDone = capturedKeys.has('boot')
  const doneCount = EXTERIOR_SHOT_KEYS.filter((key) => capturedKeys.has(key)).length

  return (
    <View style={styles.card}>
      <View style={styles.diagramArea}>
        <Svg width="100%" height={230} viewBox="0 0 300 430">
          <Ellipse cx="150" cy="410" rx="120" ry="10" fill="#00000010" />
          <Path
            d="M95 60 Q80 30 150 26 Q220 30 205 60 L222 110 Q234 140 232 200 L232 300 Q234 350 220 372 L215 390 Q212 402 195 402 L105 402 Q88 402 85 390 L80 372 Q66 350 68 300 L68 200 Q66 140 78 110 Z"
            fill="#F4F7F5"
            stroke="#C9BFA8"
            strokeWidth={2.5}
          />
          <Path d="M108 96 L192 96 L202 130 L98 130 Z" fill="#DCE9E1" stroke="#B8CFC2" strokeWidth={1.5} />
          <Path d="M100 340 L200 340 L196 368 L104 368 Z" fill="#DCE9E1" stroke="#B8CFC2" strokeWidth={1.5} />
          <Rect x="86" y="150" width="14" height="150" rx="6" fill="#E5DFD0" />
          <Rect x="200" y="150" width="14" height="150" rx="6" fill="#E5DFD0" />
        </Svg>

        {MARKERS.map((marker, index) => {
          const done = capturedKeys.has(marker.key)
          return (
            <Pressable
              key={marker.key}
              onPress={() => onPressShot(marker.key)}
              style={[styles.marker, { left: marker.left, top: marker.top }, done && styles.markerDone]}
            >
              {done ? (
                <IconButton icon="check-bold" size={13} iconColor="#fff" style={styles.markerIcon} />
              ) : (
                <Text style={styles.markerNum}>{index + 1}</Text>
              )}
            </Pressable>
          )
        })}

        <View style={styles.windscreenBadge} pointerEvents="none">
          <Text style={styles.windscreenBadgeText}>windscreen check</Text>
        </View>

        <Pressable
          onPress={() => onPressShot('boot')}
          style={[styles.bootMarker, { left: '50%', top: '103%' }, bootDone && styles.markerDone]}
        >
          {bootDone ? (
            <IconButton icon="check-bold" size={12} iconColor="#fff" style={styles.markerIcon} />
          ) : (
            <Text style={styles.bootLabel}>BOOT</Text>
          )}
        </Pressable>
      </View>

      <Text variant="labelSmall" style={styles.caption}>
        {doneCount === EXTERIOR_SHOT_KEYS.length
          ? 'All exterior angles captured'
          : `Tap an angle to take that photo — ${doneCount} of ${EXTERIOR_SHOT_KEYS.length} done`}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingTop: 14,
    paddingBottom: 10,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  diagramArea: {
    position: 'relative',
    marginBottom: 24,
  },
  marker: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#C9BFA8',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },
  markerDone: {
    backgroundColor: brandColors.emerald,
    borderColor: brandColors.emerald,
    borderStyle: 'solid',
  },
  markerNum: {
    fontSize: 12,
    fontWeight: '800',
    color: brandColors.charcoalSoft,
  },
  markerIcon: {
    margin: 0,
  },
  bootMarker: {
    position: 'absolute',
    width: 46,
    height: 22,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#C9BFA8',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -23 }, { translateY: -11 }],
  },
  bootLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: brandColors.charcoalSoft,
    letterSpacing: 0.3,
  },
  windscreenBadge: {
    position: 'absolute',
    left: '50%',
    top: '19%',
    transform: [{ translateX: -50 }, { translateY: -10 }],
    backgroundColor: brandColors.goldSoft,
    borderWidth: 1,
    borderColor: brandColors.gold,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    width: 100,
    alignItems: 'center',
  },
  windscreenBadgeText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#8A5A00',
  },
  caption: {
    textAlign: 'center',
    opacity: 0.6,
  },
})
