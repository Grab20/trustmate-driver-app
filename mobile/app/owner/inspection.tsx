import { ScrollView, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { useOwnerFleet } from '../../src/hooks/useOwnerFleet'
import { LoadingScreen } from '../../src/components/LoadingScreen'
import { InspectionFleetRow } from '../../src/components/InspectionFleetRow'
import { brandColors } from '../../src/theme/theme'

export default function OwnerInspectionScreen() {
  const router = useRouter()
  const { data: fleet, isLoading } = useOwnerFleet()

  if (isLoading) return <LoadingScreen />

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {fleet && fleet.length > 0 ? (
        fleet.map((entry) => (
          <InspectionFleetRow
            key={entry.id}
            entry={entry}
            onPress={() =>
              router.push({
                pathname: '/owner/driver/[id]',
                params: { id: entry.driver_id ?? '', carId: entry.car_id ?? '' },
              })
            }
          />
        ))
      ) : (
        <Text variant="bodyMedium" style={styles.empty}>
          No matched drivers yet.
        </Text>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: brandColors.paper,
  },
  container: {
    padding: 24,
  },
  empty: {
    opacity: 0.6,
    marginTop: 32,
    textAlign: 'center',
  },
})
