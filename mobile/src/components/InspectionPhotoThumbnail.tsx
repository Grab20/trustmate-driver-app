import { Image, StyleSheet, View, Pressable, Linking } from 'react-native'
import { ActivityIndicator, IconButton, Text } from 'react-native-paper'
import { useSignedPhotoUrl } from '../hooks/useSignedPhotoUrl'

export function InspectionPhotoThumbnail({ path }: { path: string }) {
  const { data: url, isLoading } = useSignedPhotoUrl(path)
  const isPdf = path.toLowerCase().endsWith('.pdf')

  if (isLoading || !url) {
    return (
      <View style={[styles.thumbnail, styles.placeholder]}>
        <ActivityIndicator size="small" />
      </View>
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

  return <Image source={{ uri: url }} style={styles.thumbnail} />
}

const styles = StyleSheet.create({
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eee',
  },
  pdfIcon: {
    margin: 0,
  },
})
