import { View, StyleSheet } from 'react-native'
import { Text, Icon } from 'react-native-paper'
import type { ActivityItem } from '../hooks/useRecentActivity'

const INSPECTION_TYPE_LABELS: Record<string, string> = {
  weekly_checkin: 'Vehicle Inspection',
  proof_of_payment: 'Proof of Payment',
  incident_report: 'Incident Report',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function ActivityRow({ item }: { item: ActivityItem }) {
  if (item.type === 'trip') {
    const { trip } = item
    return (
      <View style={styles.row}>
        <Icon source="car" size={20} />
        <View style={styles.rowText}>
          <Text variant="bodyMedium">
            {trip.start_location ?? 'Unknown'} → {trip.end_location ?? 'Unknown'}
          </Text>
          <Text variant="bodySmall" style={styles.meta}>
            {(trip.distance_km ?? 0).toFixed(1)} km · {formatDate(trip.started_at)}
          </Text>
        </View>
      </View>
    )
  }

  const { inspection } = item
  return (
    <View style={styles.row}>
      <Icon source="clipboard-check-outline" size={20} />
      <View style={styles.rowText}>
        <Text variant="bodyMedium">
          {INSPECTION_TYPE_LABELS[inspection.inspection_type] ?? inspection.inspection_type}
        </Text>
        <Text variant="bodySmall" style={styles.meta}>
          {inspection.status} · {formatDate(inspection.created_at ?? new Date().toISOString())}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowText: {
    marginLeft: 12,
    flex: 1,
  },
  meta: {
    opacity: 0.6,
    marginTop: 2,
  },
})
