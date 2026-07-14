import { Stack } from 'expo-router'
import { brandColors } from '../../../src/theme/theme'

export default function ActivityLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: brandColors.darkGreen },
        headerTintColor: '#fff',
        headerTitleStyle: { color: '#fff' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Activity' }} />
      <Stack.Screen name="[tripId]" options={{ title: 'Trip Details' }} />
    </Stack>
  )
}
