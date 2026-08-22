import { Redirect, Tabs } from 'expo-router'
import { useAuthStore } from '../../src/stores/authStore'
import { useMyProfile } from '../../src/hooks/useMyProfile'
import { LoadingScreen } from '../../src/components/LoadingScreen'
import { usePushNotifications } from '../../src/hooks/usePushNotifications'
import { useAutoTripTracking } from '../../src/hooks/useAutoTripTracking'
import { TabIcon } from '../../src/components/TabIcon'
import { HeaderAvatar } from '../../src/components/HeaderAvatar'
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
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: brandColors.deep },
        headerTintColor: '#fff',
        headerTitleStyle: { color: '#fff' },
        tabBarActiveTintColor: brandColors.emerald,
        tabBarInactiveTintColor: '#8A8A8A',
        tabBarStyle: {
          height: 64,
          paddingTop: 6,
          paddingBottom: 10,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -2 },
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerRight: () => <HeaderAvatar />,
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon source="home-variant" size={size} color={color as string} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="inspection"
        options={{
          title: 'Inspection',
          headerRight: () => <HeaderAvatar />,
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon source="clipboard-check-outline" size={size} color={color as string} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon source="pulse" size={size} color={color as string} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="rental"
        options={{
          title: 'Rental',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon source="car" size={size} color={color as string} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  )
}
