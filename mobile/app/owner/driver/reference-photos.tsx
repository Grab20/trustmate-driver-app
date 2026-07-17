import { useMemo, useState } from 'react'
import { View, StyleSheet, ScrollView, Alert } from 'react-native'
import { Text, Button } from 'react-native-paper'
import * as ImagePicker from 'expo-image-picker'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCar } from '../../../src/hooks/useCar'
import { useCarReferencePhotos, useSubmitReferencePhotos } from '../../../src/hooks/useCarReferencePhotos'
import { ReferencePhotoSlot } from '../../../src/components/ReferencePhotoSlot'
import { InspectionProgress } from '../../../src/components/InspectionProgress'
import { SectionLabel } from '../../../src/components/SectionLabel'
import {
  EXTERIOR_SHOT_KEYS,
  INTERIOR_SHOT_KEYS,
  SHOT_LABELS,
  type InspectionShotKey,
} from '../../../src/components/InspectionShotGuide'
import { LoadingScreen } from '../../../src/components/LoadingScreen'

const ALL_SHOTS: InspectionShotKey[] = [...EXTERIOR_SHOT_KEYS, ...INTERIOR_SHOT_KEYS]

export default function ReferencePhotosScreen() {
  const router = useRouter()
  const { carId } = useLocalSearchParams<{ carId: string }>()
  const { data: car, isLoading: isCarLoading } = useCar(carId || undefined)
  const { data: existingPhotos, isLoading: isPhotosLoading } = useCarReferencePhotos(carId || undefined)
  const submitReferencePhotos = useSubmitReferencePhotos()

  const [localUris, setLocalUris] = useState<Partial<Record<InspectionShotKey, string>>>({})

  const existingByShotKey = useMemo(() => {
    const map: Partial<Record<InspectionShotKey, string>> = {}
    for (const row of existingPhotos ?? []) {
      map[row.shot_key as InspectionShotKey] = row.photo_path
    }
    return map
  }, [existingPhotos])

  const [uploadingKey, setUploadingKey] = useState<InspectionShotKey | null>(null)
  const capturedCount = ALL_SHOTS.filter((key) => localUris[key] || existingByShotKey[key]).length
  const allShotsCaptured = capturedCount === ALL_SHOTS.length

  async function handleCapture(key: InspectionShotKey) {
    if (!carId) return
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to take reference photos.')
      return
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 })
    if (result.canceled) return

    const uri = result.assets[0].uri
    setLocalUris((prev) => ({ ...prev, [key]: uri }))
    setUploadingKey(key)
    try {
      // Upload immediately rather than waiting for a final "Save" — the native
      // camera can force Android to reclaim the app's memory while it's open,
      // which restarts the app and would otherwise lose every shot taken
      // before the last one that got saved.
      await submitReferencePhotos.mutateAsync({ carId, photos: { [key]: uri } })
    } catch (err) {
      Alert.alert('Upload failed', err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setUploadingKey(null)
    }
  }

  if (isCarLoading || isPhotosLoading) return <LoadingScreen />

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.heading}>
        Reference Photos
      </Text>
      <Text variant="bodyMedium" style={styles.subheading}>
        {car ? `${car.make} ${car.model}` : 'Vehicle'} — take {ALL_SHOTS.length} photos of the car's current condition
        before handing it to a driver. The AI will compare each weekly inspection against these photos.
      </Text>

      <InspectionProgress completed={capturedCount} total={ALL_SHOTS.length} />

      <SectionLabel icon="car" label="EXTERIOR" />
      <View style={styles.shotsGrid}>
        {EXTERIOR_SHOT_KEYS.map((key) => (
          <ReferencePhotoSlot
            key={key}
            label={SHOT_LABELS[key]}
            localUri={localUris[key] ?? null}
            existingPath={existingByShotKey[key] ?? null}
            uploading={uploadingKey === key}
            onCapture={() => handleCapture(key)}
          />
        ))}
      </View>

      <SectionLabel icon="seat-recline-normal" label="INTERIOR" />
      <View style={styles.shotsGrid}>
        {INTERIOR_SHOT_KEYS.map((key) => (
          <ReferencePhotoSlot
            key={key}
            label={SHOT_LABELS[key]}
            localUri={localUris[key] ?? null}
            existingPath={existingByShotKey[key] ?? null}
            uploading={uploadingKey === key}
            onCapture={() => handleCapture(key)}
          />
        ))}
      </View>

      <Button mode="contained" onPress={() => router.back()} style={styles.saveButton}>
        {allShotsCaptured ? 'Done' : `Done (${capturedCount}/${ALL_SHOTS.length} captured)`}
      </Button>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  heading: {
    marginBottom: 4,
  },
  subheading: {
    opacity: 0.7,
    marginBottom: 24,
  },
  shotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 8,
  },
})
