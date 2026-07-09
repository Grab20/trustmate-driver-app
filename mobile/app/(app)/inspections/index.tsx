import { FlatList, View, StyleSheet } from 'react-native'
import { Text, Card, Button, Chip } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { useInspectionHistory } from '../../../src/hooks/useInspections'
import { InspectionPhotoThumbnail } from '../../../src/components/InspectionPhotoThumbnail'
import { LoadingScreen } from '../../../src/components/LoadingScreen'
import type { Tables } from '../../../src/types/database'

function InspectionCard({ inspection }: { inspection: Tables<'vehicle_inspections'> }) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium">
            {new Date(inspection.created_at ?? '').toLocaleDateString()}
          </Text>
          <Chip compact>{inspection.status}</Chip>
        </View>
        {inspection.odometer_km != null && (
          <Text variant="bodyMedium" style={styles.detail}>
            Odometer: {inspection.odometer_km} km
          </Text>
        )}
        {inspection.notes && (
          <Text variant="bodyMedium" style={styles.detail}>
            {inspection.notes}
          </Text>
        )}
        {inspection.photo_urls && inspection.photo_urls.length > 0 && (
          <View style={styles.photoRow}>
            {inspection.photo_urls.map((path) => (
              <InspectionPhotoThumbnail key={path} path={path} />
            ))}
          </View>
        )}
      </Card.Content>
    </Card>
  )
}

export default function InspectionHistoryScreen() {
  const router = useRouter()
  const { data: inspections, isLoading } = useInspectionHistory()

  if (isLoading) return <LoadingScreen />

  return (
    <View style={styles.container}>
      <FlatList
        data={inspections ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <InspectionCard inspection={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text variant="bodyMedium" style={styles.empty}>
            No check-ins submitted yet.
          </Text>
        }
      />
      <Button
        mode="contained"
        onPress={() => router.push('/inspections/new')}
        style={styles.newButton}
      >
        New Check-In
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detail: {
    opacity: 0.8,
    marginBottom: 4,
  },
  photoRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  empty: {
    textAlign: 'center',
    opacity: 0.6,
    marginTop: 32,
  },
  newButton: {
    margin: 16,
  },
})
