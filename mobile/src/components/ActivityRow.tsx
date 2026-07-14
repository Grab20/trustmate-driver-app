import { View, StyleSheet, Pressable } from 'react-native'
import { Text, Icon } from 'react-native-paper'
import type { ActivityItem } from '../hooks/useRecentActivity'
import { IconBadge } from './IconBadge'
import { brandColors } from '../theme/theme'

const INSPECTION_TYPE_LABELS: Record<string, string> = {
  weekly_checkin: 'Vehicle Inspection',
  proof_of_payment: 'Proof of Payment',
  incident_report: 'Incident Report',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function ActivityRow({ item, onPress }: { item: ActivityItem; onPress?: () => void }) {
  const Wrapper = onPress ? Pressable : View

  if (item.type === 'trip') {
    const { trip } = item
    return (
      <Wrapper style={styles.row} onPress={onPress}>
        <IconBadge source="car" backgroundColor={brandColors.darkGreen} />
        <View style={styles.rowText}>
          <Text variant="bodyMedium">
            {trip.start_location ?? 'Unknown'} → {trip.end_location ?? 'Unknown'}
          </Text>
          <Text variant="bodySmall" style={styles.meta}>
            {(trip.distance_km ?? 0).toFixed(1)} km · {formatDate(trip.started_at)}
          </Text>
        </View>
        {onPress && <Icon source="chevron-right" size={20} color="#B8B8AE" />}
      </Wrapper>
    )
  }

  const { inspection } = item
  return (
    <Wrapper style={styles.row} onPress={onPress}>
      <IconBadge source="clipboard-check-outline" backgroundColor={brandColors.green} />
      <View style={styles.rowText}>
        <Text variant="bodyMedium">
          {INSPECTION_TYPE_LABELS[inspection.inspection_type] ?? inspection.inspection_type}
        </Text>
        <Text variant="bodySmall" style={styles.meta}>
          {inspection.status} · {formatDate(inspection.created_at ?? new Date().toISOString())}
        </Text>
      </View>
      {onPress && <Icon source="chevron-right" size={20} color="#B8B8AE" />}
    </Wrapper>
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
