import { FlatList, View, StyleSheet } from 'react-native'
import { Text, Card, Button, Chip } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { useInspectionHistory } from '../../../../src/hooks/useInspections'
import { InspectionPhotoThumbnail } from '../../../../src/components/InspectionPhotoThumbnail'
import { LoadingScreen } from '../../../../src/components/LoadingScreen'
import { IconBadge } from '../../../../src/components/IconBadge'
import { AIAnalysisSummary } from '../../../../src/components/AIAnalysisSummary'
import { brandColors } from '../../../../src/theme/theme'
import type { Tables } from '../../../../src/types/database'

const TYPE_LABELS: Record<string, string> = {
  weekly_checkin: 'Vehicle Inspection',
  proof_of_payment: 'Proof of Payment',
  incident_report: 'Incident Report',
}

const REVIEW_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  approved: { label: 'Approved by owner', icon: 'check-circle', color: brandColors.emerald },
  declined: { label: 'Declined by owner', icon: 'close-circle', color: brandColors.alert },
  reinspection_requested: { label: 'Owner requested a re-inspection', icon: 'refresh-circle', color: '#8A6D00' },
  flagged: { label: 'Owner flagged possible damage', icon: 'flag', color: brandColors.alert },
}

function InspectionCard({ inspection }: { inspection: Tables<'vehicle_inspections'> }) {
  const reviewConfig = REVIEW_CONFIG[inspection.owner_review_status ?? '']

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
        <AIAnalysisSummary
          inspectionType={inspection.inspection_type}
          aiAnalysis={inspection.ai_analysis}
          aiAnalyzedAt={inspection.ai_analyzed_at}
        />
        {reviewConfig && (
          <View style={styles.reviewRow}>
            <IconBadge source={reviewConfig.icon} size={14} backgroundColor={`${reviewConfig.color}22`} color={reviewConfig.color} />
            <View style={styles.reviewTextColumn}>
              <Text variant="bodyMedium" style={{ color: reviewConfig.color, fontWeight: '700' }}>
                {reviewConfig.label}
              </Text>
              {inspection.owner_review_comment && (
                <Text variant="bodySmall" style={styles.reviewComment}>
                  "{inspection.owner_review_comment}"
                </Text>
              )}
            </View>
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
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E3E3DD',
  },
  reviewTextColumn: {
    marginLeft: 10,
    flex: 1,
  },
  reviewComment: {
    opacity: 0.7,
    marginTop: 2,
    fontStyle: 'italic',
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
