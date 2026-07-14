import { ScrollView, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { useOwnerFleet } from '../../../src/hooks/useOwnerFleet'
import { LoadingScreen } from '../../../src/components/LoadingScreen'
import { RentalHealthFleetRow } from '../../../src/components/RentalHealthFleetRow'

export default function OwnerRentalScreen() {
  const router = useRouter()
  const { data: fleet, isLoading } = useOwnerFleet()

  if (isLoading) return <LoadingScreen />

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.heading}>
        Rental
      </Text>
      <Text variant="bodyMedium" style={styles.subheading}>
        Inspections, payments, and traffic fines for each driver.
      </Text>

      {fleet && fleet.length > 0 ? (
        fleet.map((entry) => (
          <RentalHealthFleetRow
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
  container: {
    padding: 24,
  },
  heading: {
    marginBottom: 4,
  },
  subheading: {
    opacity: 0.6,
    marginBottom: 20,
  },
  empty: {
    opacity: 0.6,
    marginTop: 32,
    textAlign: 'center',
  },
})
