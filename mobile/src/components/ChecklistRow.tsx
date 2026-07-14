import { View, StyleSheet } from 'react-native'
import { Text, Icon } from 'react-native-paper'
import { brandColors } from '../theme/theme'

export function ChecklistRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <View style={styles.row}>
      <Icon source={ok ? 'check-circle' : 'alert-circle'} size={18} color={ok ? brandColors.green : '#B5651D'} />
      <Text variant="bodyMedium" style={styles.label}>
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
  },
  label: {
    marginLeft: 4,
  },
})
