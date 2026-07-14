import { View, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import { IconBadge } from './IconBadge'
import { brandColors } from '../theme/theme'

export function SectionLabel({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.row}>
      <IconBadge source={icon} size={14} backgroundColor={brandColors.darkGreen} />
      <Text variant="labelMedium" style={styles.label}>
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  label: {
    opacity: 0.6,
    letterSpacing: 0.5,
  },
})
