import { View, StyleSheet } from 'react-native'
import { Text, Card, Chip } from 'react-native-paper'
import type { Tables } from '../types/database'

export function TrafficOffenceRow({ offence }: { offence: Tables<'traffic_offences'> }) {
  const statusStyle = STATUS_STYLES[offence.status] ?? STATUS_STYLES.unpaid

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium">{offence.offence_type ?? 'Traffic Offence'}</Text>
          <Chip compact style={statusStyle.chip} textStyle={statusStyle.text}>
            {offence.status}
          </Chip>
        </View>
        <Text variant="bodySmall" style={styles.date}>
          {new Date(offence.offence_date).toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
        {offence.description && (
          <Text variant="bodyMedium" style={styles.description}>
            {offence.description}
          </Text>
        )}
        {offence.fine_amount != null && (
          <Text variant="bodyMedium" style={styles.fine}>
            Fine: R{offence.fine_amount}
          </Text>
        )}
      </Card.Content>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  date: {
    opacity: 0.6,
    marginTop: 2,
  },
  description: {
    marginTop: 8,
  },
  fine: {
    marginTop: 4,
    fontWeight: '600',
  },
  unpaidChip: {
    backgroundColor: '#FDE7E7',
  },
  unpaidText: {
    color: '#B3261E',
  },
  paidChip: {
    backgroundColor: '#DFF5E6',
  },
  paidText: {
    color: '#1E7A3D',
  },
  disputedChip: {
    backgroundColor: '#FFF4D6',
  },
  disputedText: {
    color: '#8A6D00',
  },
})

const STATUS_STYLES: Record<string, { chip: object; text: object }> = {
  unpaid: { chip: styles.unpaidChip, text: styles.unpaidText },
  paid: { chip: styles.paidChip, text: styles.paidText },
  disputed: { chip: styles.disputedChip, text: styles.disputedText },
}
