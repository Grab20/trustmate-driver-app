import { View, StyleSheet } from 'react-native'
import { Icon } from 'react-native-paper'
import { brandColors } from '../theme/theme'

type IconBadgeProps = {
  source: string
  size?: number
  color?: string
  backgroundColor?: string
}

export function IconBadge({ source, size = 18, color = '#fff', backgroundColor = brandColors.green }: IconBadgeProps) {
  const badgeSize = Math.round(size * 1.9)

  return (
    <View
      style={[
        styles.badge,
        { width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2, backgroundColor },
      ]}
    >
      <Icon source={source} size={size} color={color} />
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
