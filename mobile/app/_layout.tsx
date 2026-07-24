import { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { PaperProvider } from 'react-native-paper'
import { QueryClientProvider } from '@tanstack/react-query'
import { Slot } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts, PTSerif_400Regular, PTSerif_700Bold } from '@expo-google-fonts/pt-serif'
import { queryClient } from '../src/lib/queryClient'
import { theme } from '../src/theme/theme'
import { useAuthStore } from '../src/stores/authStore'
// Side-effect import: registers the background location task handler so it's
// defined before the OS can relaunch the app in the background to deliver updates.
import '../src/tasks/backgroundLocationTask'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const isInitializing = useAuthStore((s) => s.isInitializing)
  const [fontsLoaded] = useFonts({ PTSerif_400Regular, PTSerif_700Bold })

  useEffect(() => {
    if (!isInitializing && fontsLoaded) SplashScreen.hideAsync()
  }, [isInitializing, fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={theme}>
          <SafeAreaProvider>
            <StatusBar style="dark" />
            <Slot />
          </SafeAreaProvider>
        </PaperProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}
