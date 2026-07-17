import { useState } from 'react'
import { Image, StyleSheet, View, Pressable, Linking, Modal } from 'react-native'
import { ActivityIndicator, IconButton, Text } from 'react-native-paper'
import { useSignedPhotoUrl } from '../hooks/useSignedPhotoUrl'
import { brandColors } from '../theme/theme'

export function InspectionPhotoThumbnail({ path, bucket }: { path: string; bucket?: string }) {
  const { data: url, isLoading, isError, refetch } = useSignedPhotoUrl(path, bucket)
  const [showFullscreen, setShowFullscreen] = useState(false)
  const isPdf = path.toLowerCase().endsWith('.pdf')

  if (isLoading) {
    return (
      <View style={[styles.thumbnail, styles.placeholder]}>
        <ActivityIndicator size="small" />
      </View>
    )
  }

  if (isError || !url) {
    return (
      <Pressable onPress={() => refetch()} style={[styles.thumbnail, styles.placeholder]}>
        <IconButton icon="image-broken-variant" size={24} iconColor={brandColors.alert} style={styles.pdfIcon} />
        <Text variant="labelSmall" style={styles.retryText}>
          Tap to retry
        </Text>
      </Pressable>
    )
  }

  if (isPdf) {
    return (
      <Pressable onPress={() => Linking.openURL(url)} style={[styles.thumbnail, styles.placeholder]}>
        <IconButton icon="file-pdf-box" size={28} style={styles.pdfIcon} />
        <Text variant="labelSmall">View PDF</Text>
      </Pressable>
    )
  }

  return (
    <>
      <Pressable onPress={() => setShowFullscreen(true)}>
        <Image source={{ uri: url }} style={styles.thumbnail} />
      </Pressable>
      <Modal visible={showFullscreen} transparent animationType="fade" onRequestClose={() => setShowFullscreen(false)}>
        <Pressable style={styles.fullscreenOverlay} onPress={() => setShowFullscreen(false)}>
          <Image source={{ uri: url }} style={styles.fullscreenImage} resizeMode="contain" />
          <IconButton
            icon="close-circle"
            size={32}
            iconColor="#fff"
            style={styles.closeButton}
            onPress={() => setShowFullscreen(false)}
          />
        </Pressable>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  thumbnail: {
    width: 96,
    height: 96,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eee',
  },
  pdfIcon: {
    margin: 0,
  },
  retryText: {
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  fullscreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 48,
    right: 16,
  },
})
