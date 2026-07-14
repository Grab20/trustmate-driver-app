import { Redirect, Tabs } from 'expo-router'
import { Icon } from 'react-native-paper'
import { useAuthStore } from '../../src/stores/authStore'
import { useMyProfile } from '../../src/hooks/useMyProfile'
import { LoadingScreen } from '../../src/components/LoadingScreen'
import { usePushNotifications } from '../../src/hooks/usePushNotifications'
import { useAutoTripTracking } from '../../src/hooks/useAutoTripTracking'
import { CrashAlertModal } from '../../src/components/CrashAlertModal'
import { brandColors } from '../../src/theme/theme'

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
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: brandColors.darkGreen },
          headerTintColor: '#fff',
          headerTitleStyle: { color: '#fff' },
          tabBarActiveTintColor: brandColors.green,
          tabBarInactiveTintColor: '#8A8A8A',
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Icon source="home-variant" size={size} color={color as string} />,
          }}
        />
        <Tabs.Screen
          name="activity"
          options={{
            title: 'Activity',
            tabBarIcon: ({ color, size }) => <Icon source="pulse" size={size} color={color as string} />,
          }}
        />
        <Tabs.Screen
          name="rental"
          options={{
            title: 'Rental',
            headerShown: false,
            tabBarIcon: ({ color, size }) => <Icon source="car" size={size} color={color as string} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <Icon source="account" size={size} color={color as string} />,
          }}
        />
      </Tabs>
      <CrashAlertModal />
    </>
  )
}
