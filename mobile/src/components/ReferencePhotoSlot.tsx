import { View, Image, StyleSheet, Pressable } from 'react-native'
import { IconButton, Text, ActivityIndicator } from 'react-native-paper'
import { InspectionPhotoThumbnail } from './InspectionPhotoThumbnail'
import { brandColors } from '../theme/theme'

type ReferencePhotoSlotProps = {
  label: string
  localUri: string | null
  existingPath: string | null
  uploading?: boolean
  onCapture: () => void
  damageCount?: number
  onViewDamage?: () => void
}

export function ReferencePhotoSlot({
  label,
  localUri,
  existingPath,
  uploading,
  onCapture,
  damageCount = 0,
  onViewDamage,
}: ReferencePhotoSlotProps) {
  return (
    <View style={styles.container}>
      {localUri ? (
        <Pressable onPress={onCapture} disabled={uploading}>
          <Image source={{ uri: localUri }} style={styles.localPhoto} />
          {uploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          )}
        </Pressable>
      ) : existingPath ? (
        <View style={styles.existingWrap}>
          <Pressable onPress={damageCount > 0 ? onViewDamage : onCapture}>
            <InspectionPhotoThumbnail path={existingPath} bucket="car-reference-photos" />
          </Pressable>
          {damageCount > 0 && (
            <View style={styles.damageBadge}>
              <Text style={styles.damageBadgeText}>{damageCount}</Text>
            </View>
          )}
          <Pressable onPress={onCapture} style={styles.retakeBadge}>
            <IconButton icon="camera-retake" size={16} iconColor="#fff" style={styles.retakeIcon} />
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={onCapture} style={styles.placeholder}>
          <IconButton icon="camera-plus" size={28} iconColor={brandColors.emerald} />
        </Pressable>
      )}
      <Text variant="labelMedium" style={[styles.label, (localUri || existingPath) && styles.labelCaptured]}>
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '30%',
    marginBottom: 16,
    alignItems: 'center',
  },
  placeholder: {
    width: 96,
    height: 96,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#DCE4DE',
    borderStyle: 'dashed',
    backgroundColor: '#F4F7F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  localPhoto: {
    width: 96,
    height: 96,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: brandColors.emerald,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  existingWrap: {
    position: 'relative',
  },
  retakeBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  retakeIcon: {
    margin: 0,
  },
  damageBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 4,
    backgroundColor: brandColors.alert,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  damageBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  label: {
    marginTop: 4,
    textAlign: 'center',
  },
  labelCaptured: {
    color: brandColors.emerald,
    fontWeight: '700',
  },
})
