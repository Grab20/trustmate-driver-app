import { Redirect, Stack } from 'expo-router'
import { useAuthStore } from '../../src/stores/authStore'
import { useMyProfile } from '../../src/hooks/useMyProfile'
import { LoadingScreen } from '../../src/components/LoadingScreen'
import { usePushNotifications } from '../../src/hooks/usePushNotifications'

export default function OwnerLayout() {
  const session = useAuthStore((s) => s.session)
  const isInitializing = useAuthStore((s) => s.isInitializing)
  const { data: profile, isLoading: isProfileLoading } = useMyProfile()
  usePushNotifications()

  if (isInitializing || isProfileLoading) return <LoadingScreen />
  if (!session) return <Redirect href="/login" />
  if (profile?.role === 'driver') return <Redirect href="/" />

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Your Fleet' }} />
      <Stack.Screen name="driver/[id]" options={{ title: 'Driver' }} />
    </Stack>
  )
}
