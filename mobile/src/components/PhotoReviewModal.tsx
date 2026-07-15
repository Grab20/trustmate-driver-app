import { Modal, View, Image, StyleSheet } from 'react-native'
import { Text, Button } from 'react-native-paper'
import { InspectionShotGuide, type InspectionShotKey } from './InspectionShotGuide'
import { IconBadge } from './IconBadge'
import { brandColors } from '../theme/theme'

type PhotoReviewModalProps = {
  visible: boolean
  photoUri: string | null
  shotKey: InspectionShotKey
  label: string
  onRetake: () => void
  onConfirm: () => void
}

export function PhotoReviewModal({ visible, photoUri, shotKey, label, onRetake, onConfirm }: PhotoReviewModalProps) {
  if (!photoUri) return null

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
              <Image source={{ uri: photoUri }} style={styles.photo} />
            </View>
            <View style={styles.compareColumn}>
              <Text variant="labelSmall" style={styles.compareLabel}>
                EXAMPLE
              </Text>
              <View style={styles.exampleBox}>
                <InspectionShotGuide shotKey={shotKey} compact />
              </View>
            </View>
          </View>

          <View style={styles.tipRow}>
            <IconBadge source="lightbulb-on-outline" size={14} backgroundColor={brandColors.green} />
            <Text variant="bodySmall" style={styles.tipText}>
              Make sure the whole car is in frame and well-lit. Move closer if the car looks too small, or step back
              if it's cut off.
            </Text>
          </View>

          <View style={styles.actionRow}>
            <Button mode="outlined" onPress={onRetake} style={styles.actionButton}>
              Retake
            </Button>
            <Button mode="contained" onPress={onConfirm} style={styles.actionButton}>
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
    borderColor: brandColors.green,
  },
  exampleBox: {
    width: '100%',
    minHeight: 150,
    borderRadius: 12,
    backgroundColor: '#F4F7F5',
    alignItems: 'center',
    justifyContent: 'center',
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
