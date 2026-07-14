import { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import { Text } from 'react-native-paper'
import { brandColors } from '../theme/theme'

type InspectionProgressProps = {
  completed: number
  total: number
}

export function InspectionProgress({ completed, total }: InspectionProgressProps) {
  const widthAnim = useRef(new Animated.Value(0)).current
  const isComplete = completed >= total

  useEffect(() => {
    Animated.spring(widthAnim, {
      toValue: total > 0 ? completed / total : 0,
      useNativeDriver: false,
      friction: 8,
    }).start()
  }, [completed, total])

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text variant="labelMedium" style={styles.label}>
          {isComplete ? 'All photos captured' : `${completed} of ${total} photos captured`}
        </Text>
        <Text variant="labelMedium" style={[styles.count, isComplete && styles.countComplete]}>
          {completed}/{total}
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            isComplete && styles.fillComplete,
            {
              width: widthAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            },
          ]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    opacity: 0.7,
  },
  count: {
    fontWeight: '700',
    color: brandColors.darkGreen,
  },
  countComplete: {
    color: brandColors.green,
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
    backgroundColor: brandColors.darkGreen,
  },
  fillComplete: {
    backgroundColor: brandColors.green,
  },
})
