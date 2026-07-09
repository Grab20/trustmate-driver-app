import { Redirect, Slot } from 'expo-router'
import { useAuthStore } from '../../src/stores/authStore'
import { LoadingScreen } from '../../src/components/LoadingScreen'

export default function AppLayout() {
  const session = useAuthStore((s) => s.session)
  const isInitializing = useAuthStore((s) => s.isInitializing)

  if (isInitializing) return <LoadingScreen />
  if (!session) return <Redirect href="/login" />

  return <Slot />
}
