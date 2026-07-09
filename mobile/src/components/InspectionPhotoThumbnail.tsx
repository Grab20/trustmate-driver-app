import { Image, StyleSheet, View } from 'react-native'
import { ActivityIndicator } from 'react-native-paper'
import { useSignedPhotoUrl } from '../hooks/useSignedPhotoUrl'

export function InspectionPhotoThumbnail({ path }: { path: string }) {
  const { data: url, isLoading } = useSignedPhotoUrl(path)

  if (isLoading || !url) {
    return (
      <View style={[styles.thumbnail, styles.placeholder]}>
        <ActivityIndicator size="small" />
      </View>
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
})
