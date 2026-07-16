import { View, Image, StyleSheet, Pressable } from 'react-native'
import { IconButton, Text } from 'react-native-paper'
import { InspectionPhotoThumbnail } from './InspectionPhotoThumbnail'
import { brandColors } from '../theme/theme'

type ReferencePhotoSlotProps = {
  label: string
  localUri: string | null
  existingPath: string | null
  onCapture: () => void
}

export function ReferencePhotoSlot({ label, localUri, existingPath, onCapture }: ReferencePhotoSlotProps) {
  return (
    <View style={styles.container}>
      {localUri ? (
        <Pressable onPress={onCapture}>
          <Image source={{ uri: localUri }} style={styles.localPhoto} />
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
