import { useState } from 'react'
import { View, Image, StyleSheet, Pressable, Modal } from 'react-native'
import { Text, IconButton, Button } from 'react-native-paper'
import { InspectionShotGuide, type InspectionShotKey } from './InspectionShotGuide'

type PhotoSlotProps = {
  label: string
  shotKey: InspectionShotKey
  uri: string | null
  onCapture: () => void
}

export function PhotoSlot({ label, shotKey, uri, onCapture }: PhotoSlotProps) {
  const [showGuide, setShowGuide] = useState(false)

  return (
    <View style={styles.container}>
      <Pressable onPress={onCapture}>
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
      </Pressable>
      <View style={styles.labelRow}>
        <Text variant="labelMedium" style={styles.label}>
          {label}
        </Text>
        <IconButton icon="information-outline" size={16} style={styles.infoIcon} onPress={() => setShowGuide(true)} />
      </View>

      <Modal visible={showGuide} transparent animationType="fade" onRequestClose={() => setShowGuide(false)}>
        <View style={styles.overlay}>
          <View style={styles.guideCard}>
            <Text variant="titleMedium" style={styles.guideTitle}>
              {label} Example
            </Text>
            <InspectionShotGuide shotKey={shotKey} />
            <Button mode="contained" onPress={() => setShowGuide(false)}>
              Got It
            </Button>
          </View>
        </View>
      </Modal>
    </View>
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIcon: {
    margin: 0,
    marginLeft: -2,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  guideCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
  },
  guideTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
})
