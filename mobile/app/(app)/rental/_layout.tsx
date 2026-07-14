import { Stack } from 'expo-router'
import { brandColors } from '../../../src/theme/theme'

export default function RentalLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: brandColors.darkGreen },
        headerTintColor: '#fff',
        headerTitleStyle: { color: '#fff' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Rental' }} />
      <Stack.Screen name="inspections/index" options={{ title: 'Inspection History' }} />
      <Stack.Screen name="inspections/new" options={{ title: 'Vehicle Inspection' }} />
      <Stack.Screen name="inspections/payment" options={{ title: 'Proof of Payment' }} />
      <Stack.Screen name="traffic-offences" options={{ title: 'Traffic Offences' }} />
      <Stack.Screen name="report-incident" options={{ title: 'Report Incident' }} />
    </Stack>
  )
}
