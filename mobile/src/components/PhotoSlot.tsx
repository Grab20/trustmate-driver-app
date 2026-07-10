import { View, Image, StyleSheet, Pressable } from 'react-native'
import { Text, IconButton } from 'react-native-paper'

type PhotoSlotProps = {
  label: string
  uri: string | null
  onCapture: () => void
}

export function PhotoSlot({ label, uri, onCapture }: PhotoSlotProps) {
  return (
    <Pressable onPress={onCapture} style={styles.container}>
      {uri ? (
        <>
          <Image source={{ uri }} style={styles.photo} />
          <View style={styles.retakeBadge}>
            <IconButton icon="camera-retake" size={16} iconColor="#fff" style={styles.retakeIcon} />
          </View>
        </>
      ) : (
        <View style={styles.placeholder}>
          <IconButton icon="camera-plus" size={28} />
        </View>
      )}
      <Text variant="labelMedium" style={styles.label}>
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '30%',
    marginBottom: 16,
    alignItems: 'center',
  },
  photo: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
  },
  placeholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
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
})
