import { Modal, View, Image, Pressable, StyleSheet } from 'react-native'
import { Text, IconButton } from 'react-native-paper'
import { useSignedPhotoUrl } from '../hooks/useSignedPhotoUrl'
import type { DamageItem } from '../types/inspectionReport'
import { brandColors } from '../theme/theme'

type DamageOverlayModalProps = {
  visible: boolean
  onClose: () => void
  photoPath: string | null
  damage: DamageItem | null
}

export function DamageOverlayModal({ visible, onClose, photoPath, damage }: DamageOverlayModalProps) {
  const { data: url } = useSignedPhotoUrl(photoPath ?? undefined, 'inspection-photos')

  if (!damage) return null

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.closeButton} onPress={onClose}>
          <IconButton icon="close-circle" size={32} iconColor="#fff" />
        </Pressable>
        <View style={styles.imageWrap}>
          {url && <Image source={{ uri: url }} style={styles.image} resizeMode="contain" />}
          {damage.boundingBox && (
            <View
              pointerEvents="none"
              style={[
                styles.marker,
                {
                  left: `${damage.boundingBox.x * 100}%`,
                  top: `${damage.boundingBox.y * 100}%`,
                  width: `${damage.boundingBox.width * 100}%`,
                  height: `${damage.boundingBox.height * 100}%`,
                },
              ]}
            />
          )}
        </View>
        <View style={styles.infoCard}>
          <Text variant="titleMedium" style={styles.infoTitle}>
            {damage.type}
          </Text>
          <Text variant="bodyMedium" style={styles.infoRow}>
            Location: {damage.location}
          </Text>
          <Text variant="bodyMedium" style={styles.infoRow}>
            Confidence: {damage.confidencePercent}%
          </Text>
          {damage.estimatedSizeCm != null && (
            <Text variant="bodyMedium" style={styles.infoRow}>
              Estimated size: {damage.estimatedSizeCm} cm
            </Text>
          )}
          <Text variant="bodySmall" style={styles.description}>
            {damage.description}
          </Text>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    padding: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 48,
    right: 16,
    zIndex: 1,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  marker: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: brandColors.errorRed,
    borderRadius: 6,
    backgroundColor: 'rgba(199,67,58,0.15)',
  },
  infoCard: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  infoTitle: {
    color: brandColors.errorRed,
    marginBottom: 8,
  },
  infoRow: {
    marginBottom: 4,
  },
  description: {
    marginTop: 8,
    opacity: 0.7,
  },
})
