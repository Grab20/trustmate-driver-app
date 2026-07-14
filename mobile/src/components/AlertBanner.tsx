import { View, StyleSheet } from 'react-native'
import { Text, Button } from 'react-native-paper'
import { IconBadge } from './IconBadge'

type AlertBannerProps = {
  title: string
  subtitle: string
  buttonLabel: string
  onPress: () => void
  variant?: 'amber' | 'dark'
  icon?: string
}

export function AlertBanner({
  title,
  subtitle,
  buttonLabel,
  onPress,
  variant = 'amber',
  icon = 'alert-circle-outline',
}: AlertBannerProps) {
  const isDark = variant === 'dark'

  return (
    <View style={[styles.container, isDark ? styles.darkContainer : styles.amberContainer]}>
      <IconBadge
        source={icon}
        backgroundColor={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(122,74,0,0.15)'}
        color={isDark ? '#fff' : '#7A4A00'}
      />
      <View style={styles.textColumn}>
        <Text variant="bodyMedium" style={isDark ? styles.darkTitle : styles.amberTitle}>
          {title}
        </Text>
        <Text
          variant="titleMedium"
          style={[styles.subtitle, isDark ? styles.darkTitle : styles.amberTitle]}
        >
          {subtitle}
        </Text>
      </View>
      <Button
        mode="contained"
        onPress={onPress}
        buttonColor={isDark ? '#fff' : undefined}
        textColor={isDark ? '#12331F' : '#fff'}
        style={!isDark && styles.amberButton}
      >
        {buttonLabel}
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  amberContainer: {
    backgroundColor: '#FBE8C8',
  },
  darkContainer: {
    backgroundColor: '#12331F',
  },
  textColumn: {
    flex: 1,
    marginHorizontal: 12,
  },
  amberTitle: {
    color: '#7A4A00',
  },
  darkTitle: {
    color: '#fff',
  },
  subtitle: {
    fontWeight: '700',
    marginTop: 2,
  },
  amberButton: {
    backgroundColor: '#B5651D',
  },
})
