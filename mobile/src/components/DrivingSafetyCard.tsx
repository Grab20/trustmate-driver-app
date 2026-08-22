import { View, StyleSheet } from 'react-native'
import { Text, Card } from 'react-native-paper'
import { SectionLabel } from './SectionLabel'
import type { DrivingSafetySummary, TripMetrics } from '../hooks/useDrivingSafety'
import { brandColors } from '../theme/theme'

function formatHoursMinutes(totalSeconds: number): string {
  const totalMinutes = Math.round(totalSeconds / 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function formatSpeed(kmh: number | null): string {
  return kmh != null ? `${Math.round(kmh)} km/h` : '—'
}

function TripMetricsGrid({ metrics }: { metrics: TripMetrics }) {
  const cells: { label: string; value: string }[] = [
    { label: 'Distance', value: `${metrics.totalDistanceKm.toFixed(1)} km` },
    { label: 'Trips', value: `${metrics.totalTrips}` },
    { label: 'Driving Time', value: formatHoursMinutes(metrics.totalDurationSeconds) },
    { label: 'Idle Time', value: formatHoursMinutes(metrics.idleSeconds) },
    { label: 'Avg Speed', value: formatSpeed(metrics.avgSpeedKmh) },
    { label: 'Max Speed', value: formatSpeed(metrics.maxSpeedKmh) },
    { label: 'Night Trips', value: `${metrics.nightTrips}` },
    { label: 'Weekend Trips', value: `${metrics.weekendTrips}` },
  ]

  return (
    <View style={styles.grid}>
      {cells.map((cell) => (
        <View key={cell.label} style={styles.gridCell}>
          <Text variant="titleMedium" style={styles.gridValue}>
            {cell.value}
          </Text>
          <Text variant="bodySmall" style={styles.gridLabel}>
            {cell.label}
          </Text>
        </View>
      ))}
    </View>
  )
}

export function DrivingSafetyCard({ summary }: { summary: DrivingSafetySummary }) {
  return (
    <>
      <SectionLabel icon="shield-car" label="TRIP ACTIVITY" />
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="labelSmall" style={styles.sectionSubLabel}>
            THIS WEEK
          </Text>
          <TripMetricsGrid metrics={summary.tripMetrics} />
        </Card.Content>
      </Card>
    </>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  sectionSubLabel: {
    color: brandColors.charcoalSoft,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  gridCell: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  gridValue: {
    color: brandColors.deep,
  },
  gridLabel: {
    color: brandColors.charcoalSoft,
    opacity: 0.85,
  },
})
