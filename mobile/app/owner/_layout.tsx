import { Redirect, Tabs } from 'expo-router'
import { useAuthStore } from '../../src/stores/authStore'
import { useMyProfile } from '../../src/hooks/useMyProfile'
import { LoadingScreen } from '../../src/components/LoadingScreen'
import { usePushNotifications } from '../../src/hooks/usePushNotifications'
import { TabIcon } from '../../src/components/TabIcon'
import { brandColors } from '../../src/theme/theme'

export default function OwnerLayout() {
  const session = useAuthStore((s) => s.session)
  const isInitializing = useAuthStore((s) => s.isInitializing)
  const { data: profile, isLoading: isProfileLoading } = useMyProfile()
  usePushNotifications()

  if (isInitializing || isProfileLoading) return <LoadingScreen />
  if (!session) return <Redirect href="/login" />
  if (profile?.role === 'driver') return <Redirect href="/" />

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: brandColors.darkGreen },
        headerTintColor: '#fff',
        headerTitleStyle: { color: '#fff' },
        tabBarActiveTintColor: brandColors.green,
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
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon source="home-variant" size={size} color={color as string} focused={focused} />
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
        name="inspection"
        options={{
          title: 'Inspection',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon source="clipboard-check-outline" size={size} color={color as string} focused={focused} />
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
        name="driver"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  )
}
