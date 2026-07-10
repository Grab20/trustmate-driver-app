import { Redirect, Stack } from 'expo-router'
import { useAuthStore } from '../../src/stores/authStore'
import { LoadingScreen } from '../../src/components/LoadingScreen'
import { usePushNotifications } from '../../src/hooks/usePushNotifications'
import { useAutoTripTracking } from '../../src/hooks/useAutoTripTracking'

export default function AppLayout() {
  const session = useAuthStore((s) => s.session)
  const isInitializing = useAuthStore((s) => s.isInitializing)
  usePushNotifications()
  useAutoTripTracking()

  if (isInitializing) return <LoadingScreen />
  if (!session) return <Redirect href="/login" />

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Dashboard' }} />
      <Stack.Screen name="trip" options={{ title: 'Trip Tracking' }} />
      <Stack.Screen name="inspections/index" options={{ title: 'Check-Ins' }} />
      <Stack.Screen name="inspections/new" options={{ title: 'New Check-In' }} />
    </Stack>
  )
}
