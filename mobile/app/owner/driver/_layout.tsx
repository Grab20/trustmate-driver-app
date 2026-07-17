import { Stack } from 'expo-router'
import { brandColors } from '../../../src/theme/theme'

export default function OwnerDriverLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: brandColors.deep },
        headerTintColor: '#fff',
        headerTitleStyle: { color: '#fff' },
      }}
    >
      <Stack.Screen name="[id]" options={{ title: 'Driver' }} />
      <Stack.Screen name="trip/[tripId]" options={{ title: 'Trip Details' }} />
      <Stack.Screen name="reference-photos" options={{ title: 'Reference Photos' }} />
      <Stack.Screen name="inspection/[inspectionId]" options={{ title: 'Vehicle Health Report' }} />
    </Stack>
  )
}
