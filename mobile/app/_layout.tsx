import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { PaperProvider } from 'react-native-paper'
import { QueryClientProvider } from '@tanstack/react-query'
import { Slot } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { queryClient } from '../src/lib/queryClient'
import { theme } from '../src/theme/theme'
// Side-effect import: registers the background location task handler so it's
// defined before the OS can relaunch the app in the background to deliver updates.
import '../src/tasks/backgroundLocationTask'

export default function RootLayout() {
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
