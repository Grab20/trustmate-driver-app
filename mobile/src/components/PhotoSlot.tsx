import { useEffect, useRef, useState } from 'react'
import { View, Image, StyleSheet, Pressable, Modal, Animated } from 'react-native'
import { Text, IconButton, Button } from 'react-native-paper'
import { InspectionShotGuide, type InspectionShotKey } from './InspectionShotGuide'
import { brandColors } from '../theme/theme'

type PhotoSlotProps = {
  label: string
  shotKey: InspectionShotKey
  uri: string | null
  onCapture: () => void
}

export function PhotoSlot({ label, shotKey, uri, onCapture }: PhotoSlotProps) {
  const [showGuide, setShowGuide] = useState(false)
  const scaleAnim = useRef(new Animated.Value(uri ? 1 : 0.85)).current

  useEffect(() => {
    if (uri) {
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 5, tension: 80 }).start()
    }
  }, [uri])

  return (
    <View style={styles.container}>
      <Pressable onPress={onCapture}>
        {uri ? (
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Image source={{ uri }} style={styles.photo} />
            <View style={styles.checkBadge}>
              <IconButton icon="check-bold" size={14} iconColor="#fff" style={styles.checkIcon} />
            </View>
            <View style={styles.retakeBadge}>
              <IconButton icon="camera-retake" size={16} iconColor="#fff" style={styles.retakeIcon} />
            </View>
          </Animated.View>
        ) : (
          <View style={styles.placeholder}>
            <IconButton icon="camera-plus" size={28} iconColor={brandColors.green} />
          </View>
        )}
      </Pressable>
      <View style={styles.labelRow}>
        <Text variant="labelMedium" style={[styles.label, uri && styles.labelCaptured]}>
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
    borderWidth: 2,
    borderColor: brandColors.green,
  },
  placeholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#DCE4DE',
    borderStyle: 'dashed',
    backgroundColor: '#F4F7F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: brandColors.green,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  checkIcon: {
    margin: 0,
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
