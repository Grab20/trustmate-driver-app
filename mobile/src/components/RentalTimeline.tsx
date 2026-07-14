import { View, StyleSheet } from 'react-native'
import { Text, Icon } from 'react-native-paper'
import { brandColors } from '../theme/theme'

export type TimelineEvent = {
  id: string
  title: string
  date: string
  icon?: string
}

export function RentalTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <View>
      {events.map((event, index) => (
        <View key={event.id} style={styles.row}>
          <View style={styles.dotColumn}>
            <View style={styles.dot}>
              <Icon source={event.icon ?? 'check'} size={12} color="#fff" />
            </View>
            {index < events.length - 1 && <View style={styles.line} />}
          </View>
          <View style={styles.textColumn}>
            <Text variant="bodyMedium" style={styles.title}>
              {event.title}
            </Text>
            <Text variant="bodySmall" style={styles.date}>
              {new Date(event.date).toLocaleDateString(undefined, {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  dotColumn: {
    alignItems: 'center',
    width: 22,
    marginRight: 12,
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: brandColors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    width: 1.5,
    flex: 1,
    backgroundColor: '#D6D6CC',
    marginVertical: 2,
  },
  textColumn: {
    flex: 1,
    paddingBottom: 16,
    paddingTop: 2,
  },
  title: {
    fontWeight: '600',
  },
  date: {
    opacity: 0.6,
    marginTop: 2,
  },
})
