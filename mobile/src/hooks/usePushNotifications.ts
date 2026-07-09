import { useEffect } from 'react'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

async function registerForPushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device.')
    return null
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }
  if (finalStatus !== 'granted') return null

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    })
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId
  const { data } = await Notifications.getExpoPushTokenAsync({ projectId })
  return data
}

export function usePushNotifications() {
  const userId = useAuthStore((s) => s.session?.user.id)

  useEffect(() => {
    if (!userId) return
    const currentUserId = userId

    let cancelled = false

    async function register() {
      const token = await registerForPushToken()
      if (!token || cancelled) return

      const { error } = await supabase.from('device_push_tokens').upsert(
        {
          user_id: currentUserId,
          expo_push_token: token,
          platform: Platform.OS === 'ios' ? 'ios' : 'android',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,expo_push_token' },
      )
      if (error) console.warn('Failed to save push token:', error.message)
    }

    register()

    return () => {
      cancelled = true
    }
  }, [userId])
}
