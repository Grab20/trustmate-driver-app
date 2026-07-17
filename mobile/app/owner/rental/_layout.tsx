import { Stack } from 'expo-router'
import { brandColors } from '../../../src/theme/theme'

export default function OwnerRentalLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: brandColors.deep },
        headerTintColor: '#fff',
        headerTitleStyle: { color: '#fff' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Rental' }} />
    </Stack>
  )
}
