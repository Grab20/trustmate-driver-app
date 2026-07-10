import { View, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'

type StatTileProps = {
  label: string
  value: string
}

export function StatTile({ label, value }: StatTileProps) {
  return (
    <View style={styles.tile}>
      <Text variant="labelMedium" style={styles.label}>
        {label}
      </Text>
      <Text variant="titleMedium">{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  tile: {
    width: '48%',
    marginBottom: 16,
  },
  label: {
    opacity: 0.6,
    marginBottom: 2,
  },
})
