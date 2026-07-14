import { View, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import { brandColors } from '../theme/theme'

type ReliabilityBarProps = {
  label: string
  percent: number
}

export function ReliabilityBar({ label, percent }: ReliabilityBarProps) {
  const clamped = Math.max(0, Math.min(100, percent))

  return (
    <View style={styles.row}>
      <View style={styles.labelRow}>
        <Text variant="bodyMedium">{label}</Text>
        <Text variant="bodyMedium" style={styles.percent}>
          {Math.round(clamped)}%
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clamped}%` }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  percent: {
    fontWeight: '600',
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EAEAE5',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: brandColors.green,
  },
})
