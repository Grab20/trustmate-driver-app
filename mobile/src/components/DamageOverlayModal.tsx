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
  bucket?: 'inspection-photos' | 'car-reference-photos'
}

// Red = major (structural/safety), Orange = minor (cosmetic), Yellow = dirty
// (cleanliness). Falls back to red when severity is unset — preserves the
// reference-photo damage scan, which doesn't classify severity.
function severityColor(severity: DamageItem['severity']): string {
  if (severity === 'minor') return '#C2701A'
  if (severity === 'dirty') return '#B8960C'
  return brandColors.alert
}

function severityTint(color: string): string {
  if (color === '#C2701A') return 'rgba(194,112,26,0.15)'
  if (color === '#B8960C') return 'rgba(184,150,12,0.15)'
  return 'rgba(199,67,58,0.15)'
}

export function DamageOverlayModal({ visible, onClose, photoPath, damage, bucket = 'inspection-photos' }: DamageOverlayModalProps) {
  const { data: url } = useSignedPhotoUrl(photoPath ?? undefined, bucket)

  if (!damage) return null

  const markerColor = severityColor(damage.severity)

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
                  borderColor: markerColor,
                  backgroundColor: severityTint(markerColor),
                },
              ]}
            />
          )}
        </View>
        <View style={styles.infoCard}>
          <View style={styles.infoTitleRow}>
            <Text variant="titleMedium" style={[styles.infoTitle, { color: markerColor }]}>
              {damage.type}
            </Text>
            {damage.severity && (
              <View style={[styles.severityPill, { backgroundColor: markerColor }]}>
                <Text variant="labelSmall" style={styles.severityPillText}>
                  {damage.severity === 'dirty' ? 'Dirty' : damage.severity === 'major' ? 'Major' : 'Minor'}
                </Text>
              </View>
            )}
          </View>
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
    borderRadius: 999,
  },
  infoCard: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  infoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  infoTitle: {
    flexShrink: 1,
  },
  severityPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  severityPillText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  infoRow: {
    marginBottom: 4,
  },
  description: {
    marginTop: 8,
    opacity: 0.7,
  },
})
