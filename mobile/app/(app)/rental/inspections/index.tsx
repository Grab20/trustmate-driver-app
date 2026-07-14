import { FlatList, View, StyleSheet } from 'react-native'
import { Text, Card, Button, Chip } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { useInspectionHistory } from '../../../../src/hooks/useInspections'
import { InspectionPhotoThumbnail } from '../../../../src/components/InspectionPhotoThumbnail'
import { LoadingScreen } from '../../../../src/components/LoadingScreen'
import type { Tables } from '../../../../src/types/database'

const TYPE_LABELS: Record<string, string> = {
  weekly_checkin: 'Vehicle Inspection',
  proof_of_payment: 'Proof of Payment',
  incident_report: 'Incident Report',
}

function InspectionCard({ inspection }: { inspection: Tables<'vehicle_inspections'> }) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View>
            <Text variant="titleMedium">
              {TYPE_LABELS[inspection.inspection_type] ?? inspection.inspection_type}
            </Text>
            <Text variant="bodySmall" style={styles.date}>
              {new Date(inspection.created_at ?? '').toLocaleDateString()}
            </Text>
          </View>
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
            Nothing submitted yet.
          </Text>
        }
      />
      <View style={styles.newButtons}>
        <Button mode="contained" onPress={() => router.push('/rental/inspections/new')} style={styles.newButton}>
          New Inspection
        </Button>
        <Button
          mode="contained-tonal"
          onPress={() => router.push('/rental/inspections/payment')}
          style={styles.newButton}
        >
          Proof of Payment
        </Button>
      </View>
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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  date: {
    opacity: 0.6,
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
  newButtons: {
    padding: 16,
  },
  newButton: {
    marginBottom: 8,
  },
})
