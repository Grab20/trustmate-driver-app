import { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Card, Button, TextInput } from 'react-native-paper'
import type { Tables } from '../types/database'
import { useReviewInspection } from '../hooks/useInspections'
import { InspectionPhotoThumbnail } from './InspectionPhotoThumbnail'
import { IconBadge } from './IconBadge'
import { brandColors } from '../theme/theme'

const TYPE_LABELS: Record<string, string> = {
  weekly_checkin: 'Vehicle Inspection',
  proof_of_payment: 'Proof of Payment',
  incident_report: 'Incident Report',
}

const STATUS_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  pending: { label: 'Awaiting Review', icon: 'clock-outline', color: '#8A6D00' },
  approved: { label: 'Approved', icon: 'check-circle', color: brandColors.green },
  declined: { label: 'Declined', icon: 'close-circle', color: brandColors.errorRed },
}

export function InspectionReviewCard({
  inspection,
  driverId,
}: {
  inspection: Tables<'vehicle_inspections'>
  driverId: string | undefined
}) {
  const reviewInspection = useReviewInspection(driverId)
  const [comment, setComment] = useState(inspection.owner_review_comment ?? '')

  const reviewStatus = inspection.owner_review_status ?? 'pending'
  const statusConfig = STATUS_CONFIG[reviewStatus] ?? STATUS_CONFIG.pending
  const canReview = reviewStatus === 'pending'

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.headerRow}>
          <Text variant="bodyMedium" style={styles.typeLabel}>
            {TYPE_LABELS[inspection.inspection_type] ?? inspection.inspection_type}
          </Text>
          <View style={styles.statusRow}>
            <IconBadge source={statusConfig.icon} size={12} backgroundColor={`${statusConfig.color}22`} color={statusConfig.color} />
            <Text variant="labelSmall" style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>
        <Text variant="bodySmall" style={styles.date}>
          {new Date(inspection.created_at ?? '').toLocaleDateString()}
        </Text>

        {(inspection.photo_urls ?? []).length > 0 ? (
          <View style={styles.photoRow}>
            {(inspection.photo_urls ?? []).map((path) => (
              <InspectionPhotoThumbnail key={path} path={path} />
            ))}
          </View>
        ) : (
          <Text variant="bodySmall" style={styles.noPhotos}>
            No photos attached.
          </Text>
        )}

        {canReview ? (
          <>
            <TextInput
              mode="outlined"
              label="Comment (e.g. there's damage on the rear bumper)"
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={2}
              style={styles.commentInput}
            />
            <View style={styles.actionRow}>
              <Button
                mode="contained"
                onPress={() => reviewInspection.mutate({ inspectionId: inspection.id, status: 'approved', comment })}
                loading={reviewInspection.isPending}
                disabled={reviewInspection.isPending}
                style={styles.actionButton}
              >
                Approve
              </Button>
              <Button
                mode="outlined"
                textColor={brandColors.errorRed}
                onPress={() => reviewInspection.mutate({ inspectionId: inspection.id, status: 'declined', comment })}
                loading={reviewInspection.isPending}
                disabled={reviewInspection.isPending}
                style={[styles.actionButton, styles.declineButton]}
              >
                Decline
              </Button>
            </View>
          </>
        ) : (
          inspection.owner_review_comment && (
            <View style={styles.reviewedComment}>
              <Text variant="bodySmall" style={styles.reviewedCommentLabel}>
                Your comment:
              </Text>
              <Text variant="bodyMedium">{inspection.owner_review_comment}</Text>
            </View>
          )
        )}
      </Card.Content>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeLabel: {
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontWeight: '700',
  },
  date: {
    opacity: 0.6,
    marginTop: 4,
  },
  photoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  noPhotos: {
    opacity: 0.6,
    marginTop: 12,
  },
  commentInput: {
    marginTop: 16,
    backgroundColor: '#fff',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
  },
  declineButton: {
    borderColor: brandColors.errorRed,
  },
  reviewedComment: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E3E3DD',
  },
  reviewedCommentLabel: {
    opacity: 0.6,
    marginBottom: 2,
  },
})
