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
}

export function ReferencePhotoSlot({ label, localUri, existingPath, uploading, onCapture }: ReferencePhotoSlotProps) {
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
          <InspectionPhotoThumbnail path={existingPath} bucket="car-reference-photos" />
          <Pressable onPress={onCapture} style={styles.retakeBadge}>
            <IconButton icon="camera-retake" size={16} iconColor="#fff" style={styles.retakeIcon} />
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={onCapture} style={styles.placeholder}>
          <IconButton icon="camera-plus" size={28} iconColor={brandColors.green} />
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
    borderColor: brandColors.green,
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
  label: {
    marginTop: 4,
    textAlign: 'center',
  },
  labelCaptured: {
    color: brandColors.green,
    fontWeight: '700',
  },
})
