import { View, StyleSheet } from 'react-native'
import { Icon } from 'react-native-paper'
import { brandColors } from '../theme/theme'

type TabIconProps = {
  source: string
  color: string
  size: number
  focused: boolean
}

export function TabIcon({ source, color, size, focused }: TabIconProps) {
  return (
    <View style={[styles.pill, focused && styles.pillFocused]}>
      <Icon source={source} size={size} color={color} />
    </View>
  )
}

const styles = StyleSheet.create({
  pill: {
    width: 44,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillFocused: {
    backgroundColor: `${brandColors.green}1F`,
  },
})
