import { Stack } from 'expo-router'
import { HeaderAvatar } from '../../../src/components/HeaderAvatar'
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
      <Stack.Screen name="index" options={{ title: 'Activity', headerRight: () => <HeaderAvatar /> }} />
      <Stack.Screen name="[tripId]" options={{ title: 'Trip Details' }} />
    </Stack>
  )
}
