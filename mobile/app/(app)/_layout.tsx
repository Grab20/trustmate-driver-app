import { Redirect, Stack } from 'expo-router'
import { useAuthStore } from '../../src/stores/authStore'
import { useMyProfile } from '../../src/hooks/useMyProfile'
import { LoadingScreen } from '../../src/components/LoadingScreen'
import { usePushNotifications } from '../../src/hooks/usePushNotifications'
import { useAutoTripTracking } from '../../src/hooks/useAutoTripTracking'
import { CrashAlertModal } from '../../src/components/CrashAlertModal'

export default function AppLayout() {
  const session = useAuthStore((s) => s.session)
  const isInitializing = useAuthStore((s) => s.isInitializing)
  const { data: profile, isLoading: isProfileLoading } = useMyProfile()
  usePushNotifications()
  useAutoTripTracking()

  if (isInitializing || isProfileLoading) return <LoadingScreen />
  if (!session) return <Redirect href="/login" />
  if (profile?.role === 'owner') return <Redirect href="/owner" />

  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Dashboard' }} />
        <Stack.Screen name="inspections/index" options={{ title: 'Inspection History' }} />
        <Stack.Screen name="inspections/new" options={{ title: 'Vehicle Inspection' }} />
        <Stack.Screen name="inspections/payment" options={{ title: 'Proof of Payment' }} />
      </Stack>
      <CrashAlertModal />
    </>
  )
}
