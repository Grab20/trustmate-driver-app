import { Modal, View, Image, StyleSheet } from 'react-native'
import { Text, Button, ActivityIndicator } from 'react-native-paper'
import { InspectionShotGuide, type InspectionShotKey } from './InspectionShotGuide'
import { InspectionPhotoThumbnail } from './InspectionPhotoThumbnail'
import { IconBadge } from './IconBadge'
import { usePhotoQualityCheck } from '../hooks/usePhotoQualityCheck'
import { brandColors } from '../theme/theme'

type PhotoReviewModalProps = {
  visible: boolean
  photoUri: string | null
  photoBase64?: string | null
  photoMimeType?: string | null
  shotKey: InspectionShotKey
  label: string
  carId?: string | null
  referencePhotoPath?: string | null
  onRetake: () => void
  onConfirm: () => void
}

export function PhotoReviewModal({
  visible,
  photoUri,
  photoBase64,
  photoMimeType,
  shotKey,
  label,
  carId,
  referencePhotoPath,
  onRetake,
  onConfirm,
}: PhotoReviewModalProps) {
  const check = usePhotoQualityCheck({
    base64: photoUri ? photoBase64 : null,
    mimeType: photoMimeType,
    shotKey,
    carId,
    referencePhotoPath,
  })

  if (!photoUri) return null

  const isChecking = check.status === 'checking'
  const isRejected = check.status === 'rejected'

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRetake}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text variant="titleMedium" style={styles.title}>
            Review: {label}
          </Text>

          <View style={styles.compareRow}>
            <View style={styles.compareColumn}>
              <Text variant="labelSmall" style={styles.compareLabel}>
                YOUR PHOTO
              </Text>
              <Image
                source={{ uri: photoUri }}
                style={[styles.photo, isRejected && styles.photoRejected]}
              />
            </View>
            <View style={styles.compareColumn}>
              <Text variant="labelSmall" style={styles.compareLabel}>
                {referencePhotoPath ? "OWNER'S EXAMPLE" : 'EXAMPLE'}
              </Text>
              {referencePhotoPath ? (
                <View style={styles.exampleBox}>
                  <InspectionPhotoThumbnail path={referencePhotoPath} bucket="car-reference-photos" />
                </View>
              ) : (
                <View style={styles.exampleBox}>
                  <InspectionShotGuide shotKey={shotKey} compact />
                </View>
              )}
            </View>
          </View>

          {isChecking ? (
            <View style={styles.checkingRow}>
              <ActivityIndicator size="small" color={brandColors.emerald} />
              <Text variant="bodySmall" style={styles.checkingText}>
                Checking photo quality…
              </Text>
            </View>
          ) : isRejected ? (
            <View style={styles.rejectRow}>
              <View style={styles.rejectHeader}>
                <IconBadge source="alert-circle" size={16} backgroundColor={brandColors.alert} />
                <Text variant="labelMedium" style={styles.rejectTitle}>
                  Photo rejected{check.issues.length > 0 ? ` (${check.issues.length} issue${check.issues.length > 1 ? 's' : ''})` : ''}
                </Text>
              </View>
              {check.issues.map((issue, index) => (
                <Text key={index} variant="bodySmall" style={styles.rejectIssue}>
                  • {issue}
                </Text>
              ))}
              <Text variant="bodySmall" style={styles.rejectHint}>
                Please retake this photo — hold the camera steady and make sure the whole car is in frame.
              </Text>
            </View>
          ) : (
            <View style={styles.tipRow}>
              <IconBadge source="lightbulb-on-outline" size={14} backgroundColor={brandColors.emerald} />
              <Text variant="bodySmall" style={styles.tipText}>
                Make sure the whole car is in frame and well-lit. Move closer if the car looks too small, or step back
                if it's cut off.
              </Text>
            </View>
          )}

          <View style={styles.actionRow}>
            <Button mode="outlined" onPress={onRetake} style={styles.actionButton}>
              Retake
            </Button>
            <Button
              mode="contained"
              onPress={onConfirm}
              disabled={isChecking || isRejected}
              style={styles.actionButton}
            >
              Use This Photo
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  compareRow: {
    flexDirection: 'row',
    gap: 12,
  },
  compareColumn: {
    flex: 1,
    alignItems: 'center',
  },
  compareLabel: {
    opacity: 0.6,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  photo: {
    width: '100%',
    aspectRatio: 0.85,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: brandColors.emerald,
  },
  photoRejected: {
    borderColor: brandColors.alert,
  },
  exampleBox: {
    width: '100%',
    minHeight: 150,
    borderRadius: 12,
    backgroundColor: '#F4F7F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    backgroundColor: '#F4F7F5',
    borderRadius: 12,
    padding: 12,
  },
  checkingText: {
    opacity: 0.8,
  },
  rejectRow: {
    marginTop: 16,
    backgroundColor: brandColors.alertSoft,
    borderRadius: 12,
    padding: 12,
  },
  rejectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  rejectTitle: {
    color: brandColors.alert,
    fontWeight: '700',
  },
  rejectIssue: {
    color: brandColors.alert,
    marginLeft: 2,
    marginBottom: 2,
  },
  rejectHint: {
    marginTop: 6,
    opacity: 0.8,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 16,
    backgroundColor: '#F4F7F5',
    borderRadius: 12,
    padding: 12,
  },
  tipText: {
    flex: 1,
    opacity: 0.8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
  },
})
