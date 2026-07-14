import { Stack } from 'expo-router'
import { brandColors } from '../../../src/theme/theme'

export default function OwnerActivityLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: brandColors.darkGreen },
        headerTintColor: '#fff',
        headerTitleStyle: { color: '#fff' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Activity' }} />
    </Stack>
  )
}
