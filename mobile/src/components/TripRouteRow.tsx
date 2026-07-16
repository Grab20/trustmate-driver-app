import { View, StyleSheet, Pressable } from 'react-native'
import { Text, Icon } from 'react-native-paper'
import { IconBadge } from './IconBadge'
import { brandColors } from '../theme/theme'

type TripRouteRowProps = {
  startLabel: string
  endLabel: string
  startTime: string
  distanceKm: number
  durationSeconds: number
  maxSpeedKmh: number
  onPress?: () => void
  tripNumber?: number
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })
}

function formatDurationShort(seconds: number): string {
  const minutes = Math.round(seconds / 60)
  return `${minutes} min`
}

export function TripRouteRow({
  startLabel,
  endLabel,
  startTime,
  distanceKm,
  durationSeconds,
  maxSpeedKmh,
  onPress,
  tripNumber,
}: TripRouteRowProps) {
  const Wrapper = onPress ? Pressable : View

  return (
    <Wrapper style={styles.container} onPress={onPress} {...(onPress ? { android_ripple: { color: '#E3E3DD' } } : {})}>
      {tripNumber != null ? (
        <View style={styles.numberBadge}>
          <Text variant="labelMedium" style={styles.numberBadgeText}>
            {tripNumber}
          </Text>
        </View>
      ) : (
        <View style={styles.dots}>
          <View style={styles.outlineDot} />
          <View style={styles.line} />
          <View style={styles.filledDot} />
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text variant="bodyMedium" style={styles.location}>
            {startLabel}
          </Text>
          <Text variant="bodySmall" style={styles.time}>
            {formatTime(startTime)}
          </Text>
        </View>
        <Text variant="titleSmall" style={styles.endLocation}>
          {endLabel}
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <IconBadge source="map-marker-distance" size={11} backgroundColor={brandColors.green} />
            <Text variant="bodySmall" style={styles.statText}>
              {distanceKm.toFixed(1)} km
            </Text>
          </View>
          <View style={styles.statItem}>
            <IconBadge source="timer-outline" size={11} backgroundColor={brandColors.darkGreen} />
            <Text variant="bodySmall" style={styles.statText}>
              {formatDurationShort(durationSeconds)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <IconBadge source="speedometer" size={11} backgroundColor="#B5651D" />
            <Text variant="bodySmall" style={styles.statText}>
              Max {Math.round(maxSpeedKmh)} km/h
            </Text>
          </View>
        </View>
      </View>
      {onPress && (
        <View style={styles.chevron}>
          <Icon source="chevron-right" size={20} color="#B8B8AE" />
        </View>
      )}
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E3E3DD',
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
    marginVertical: 2,
  },
  filledDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: brandColors.darkGreen,
  },
  numberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: brandColors.darkGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  numberBadgeText: {
    color: '#fff',
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  chevron: {
    alignSelf: 'center',
    marginLeft: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  location: {
    opacity: 0.6,
  },
  time: {
    opacity: 0.6,
  },
  endLocation: {
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 6,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    opacity: 0.7,
  },
})
