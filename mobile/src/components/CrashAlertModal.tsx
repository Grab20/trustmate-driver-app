import { useEffect, useState } from 'react'
import { Modal, View, StyleSheet } from 'react-native'
import { Text, Button } from 'react-native-paper'
import { useCrashAlert } from '../hooks/useCrashAlert'
import { CRASH_CONFIRM_WINDOW_MS } from '../lib/autoTripEngine'
import { IconBadge } from './IconBadge'
import { brandColors } from '../theme/theme'

export function CrashAlertModal() {
  const { pendingSince, confirmOk } = useCrashAlert()
  const [remainingMs, setRemainingMs] = useState(CRASH_CONFIRM_WINDOW_MS)

  useEffect(() => {
    if (!pendingSince) return
    const tick = () => setRemainingMs(Math.max(0, CRASH_CONFIRM_WINDOW_MS - (Date.now() - pendingSince)))
    tick()
    const interval = setInterval(tick, 250)
    return () => clearInterval(interval)
  }, [pendingSince])

  if (!pendingSince) return null

  const secondsLeft = Math.ceil(remainingMs / 1000)

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconRow}>
            <IconBadge source="car-emergency" size={28} backgroundColor={brandColors.alert} />
          </View>
          <Text variant="headlineSmall" style={styles.title}>
            Possible Crash Detected
          </Text>
          <Text variant="bodyMedium" style={styles.body}>
            {secondsLeft > 0
              ? `If you're OK, tap the button below. TrustMate admin will be alerted automatically in ${secondsLeft}s if you don't respond.`
              : 'Notifying TrustMate admin now…'}
          </Text>
          <Button mode="contained" onPress={confirmOk} style={styles.button}>
            I'm OK
          </Button>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
  },
  iconRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  button: {
    alignSelf: 'stretch',
  },
})
