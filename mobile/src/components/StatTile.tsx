import { View, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import { IconBadge } from './IconBadge'
import { brandColors } from '../theme/theme'

type StatTileProps = {
  label: string
  value: string
  icon?: string
}

export function StatTile({ label, value, icon }: StatTileProps) {
  return (
    <View style={styles.tile}>
      {icon && <IconBadge source={icon} size={14} backgroundColor={brandColors.green} />}
      <Text variant="labelMedium" style={[styles.label, icon && styles.labelWithIcon]}>
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
  labelWithIcon: {
    marginTop: 6,
  },
})
