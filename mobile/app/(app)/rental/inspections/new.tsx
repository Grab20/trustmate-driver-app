import { useState } from 'react'
import { View, StyleSheet, ScrollView, Alert } from 'react-native'
import { Text, TextInput, Button } from 'react-native-paper'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { useActiveRental } from '../../../../src/hooks/useActiveRental'
import { useVehicleOdometer } from '../../../../src/hooks/useVehicleOdometer'
import { useSubmitInspection } from '../../../../src/hooks/useInspections'
import { useCarReferencePhotos } from '../../../../src/hooks/useCarReferencePhotos'
import { useInspectionDraft } from '../../../../src/hooks/useInspectionDraft'
import { uploadInspectionDraftPhoto } from '../../../../src/lib/uploadInspectionDraftPhoto'
import { useAuthStore } from '../../../../src/stores/authStore'
import { PhotoSlot } from '../../../../src/components/PhotoSlot'
import { InspectionCarDiagram } from '../../../../src/components/InspectionCarDiagram'
import { InspectionProgress } from '../../../../src/components/InspectionProgress'
import { PhotoReviewModal } from '../../../../src/components/PhotoReviewModal'
import { SectionLabel } from '../../../../src/components/SectionLabel'
import {
  EXTERIOR_SHOT_KEYS,
  INTERIOR_SHOT_KEYS,
  SHOT_LABELS,
  type InspectionShotKey,
} from '../../../../src/components/InspectionShotGuide'
import { brandColors } from '../../../../src/theme/theme'

// Order matters: photo_urls is a plain array, and this order (exterior then
// interior, in the order defined in InspectionShotGuide) is the convention
// used to interpret which shot is which when displaying an inspection later.
const ALL_SHOTS: InspectionShotKey[] = [...EXTERIOR_SHOT_KEYS, ...INTERIOR_SHOT_KEYS]

export default function NewInspectionScreen() {
  const router = useRouter()
  const userId = useAuthStore((s) => s.session?.user.id)
  const { data: activeRental } = useActiveRental()
  const { data: odometer } = useVehicleOdometer(activeRental?.car_id ?? undefined)
  const { data: referencePhotos } = useCarReferencePhotos(activeRental?.car_id ?? undefined)
  const submitInspection = useSubmitInspection()
  const { draft, saveShot, clear: clearDraft } = useInspectionDraft(activeRental?.car_id ?? undefined)

  const referencePhotoByShotKey = Object.fromEntries(
    (referencePhotos ?? []).map((row) => [row.shot_key, row.photo_path]),
  ) as Partial<Record<InspectionShotKey, string>>

  const [odometerKm, setOdometerKm] = useState(
    odometer?.current_km != null ? String(odometer.current_km) : '',
  )
  const [notes, setNotes] = useState('')
  // Local-session preview only — the source of truth for what's actually
  // captured is `draft` (uploaded immediately per shot), so a shot rehydrated
  // from a prior crashed session still counts even with no entry here.
  const [shots, setShots] = useState<Record<InspectionShotKey, string | null>>(
    Object.fromEntries(ALL_SHOTS.map((key) => [key, null])) as Record<InspectionShotKey, string | null>,
  )
  const [pendingReview, setPendingReview] = useState<{
    key: InspectionShotKey
    uri: string
    base64: string | null
    mimeType: string | null
  } | null>(null)

  const capturedKeys = new Set(ALL_SHOTS.filter((key) => shots[key] || draft[key]))
  const capturedCount = capturedKeys.size
  const allShotsCaptured = capturedCount === ALL_SHOTS.length

  async function handleCapture(key: InspectionShotKey) {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to take inspection photos.')
      return
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7, base64: true })
    if (!result.canceled) {
      const asset = result.assets[0]
      setPendingReview({ key, uri: asset.uri, base64: asset.base64 ?? null, mimeType: asset.mimeType ?? null })
    }
  }

  async function handleConfirm() {
    const review = pendingReview
    setPendingReview(null)
    if (!review) return
    // Show the photo immediately, regardless of whether the car/driver ids
    // have finished loading yet — the progress bar, car diagram, and
    // thumbnails all read from this local state, so gating it on
    // activeRental being ready silently dropped the photo with no feedback
    // whenever that query was still in flight.
    setShots((prev) => ({ ...prev, [review.key]: review.uri }))

    if (!activeRental?.car_id || !userId) {
      Alert.alert('Not saved yet', 'Your vehicle details are still loading — this photo is shown but not yet backed up. It will be saved automatically once ready, or when you submit.')
      return
    }
    // Persist to storage in the background — the native camera activity can
    // cause Android to kill the app before Submit is reached, and an
    // unsaved local file would be lost along with it, silently dumping the
    // driver back at the app's home screen mid walkaround.
    try {
      const path = await uploadInspectionDraftPhoto(userId, activeRental.car_id, review.key, review.uri)
      saveShot(review.key, path)
    } catch {
      // Not fatal here — handleSubmit re-attempts the upload for any shot
      // that never made it into the draft.
    }
  }

  async function handleSubmit() {
    if (!activeRental?.car_id || !userId || !allShotsCaptured) return
    try {
      const draftPhotoPaths: string[] = []
      for (const key of ALL_SHOTS) {
        let path = draft[key]
        if (!path) {
          const localUri = shots[key]
          if (!localUri) throw new Error(`Missing photo for ${SHOT_LABELS[key]}`)
          path = await uploadInspectionDraftPhoto(userId, activeRental.car_id, key, localUri)
        }
        draftPhotoPaths.push(path)
      }

      await submitInspection.mutateAsync({
        carId: activeRental.car_id,
        applicationId: activeRental.id,
        odometerKm: odometerKm.trim() ? Number(odometerKm) : null,
        notes,
        draftPhotoPaths,
      })
      await clearDraft()
      router.back()
    } catch (err) {
      Alert.alert('Submission failed', err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.heading}>
        Vehicle Inspection
      </Text>
      <Text variant="bodyMedium" style={styles.subheading}>
        Take all {ALL_SHOTS.length} photos using your camera so your vehicle owner can review the car's condition.
      </Text>

      <InspectionProgress completed={capturedCount} total={ALL_SHOTS.length} />

      <TextInput
        label="Odometer (km)"
        value={odometerKm}
        onChangeText={setOdometerKm}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        label="Notes (optional)"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
        style={styles.input}
      />

      <SectionLabel icon="car" label="EXTERIOR" />
      <InspectionCarDiagram capturedKeys={capturedKeys} onPressShot={handleCapture} />
      <View style={styles.shotsGrid}>
        {EXTERIOR_SHOT_KEYS.map((key) => (
          <PhotoSlot
            key={key}
            label={SHOT_LABELS[key]}
            shotKey={key}
            uri={shots[key]}
            capturedPhotoPath={draft[key] ?? null}
            onCapture={() => handleCapture(key)}
            referencePhotoPath={referencePhotoByShotKey[key] ?? null}
          />
        ))}
      </View>

      <SectionLabel icon="seat-recline-normal" label="INTERIOR" />
      <View style={styles.shotsGrid}>
        {INTERIOR_SHOT_KEYS.map((key) => (
          <PhotoSlot
            key={key}
            label={SHOT_LABELS[key]}
            shotKey={key}
            uri={shots[key]}
            capturedPhotoPath={draft[key] ?? null}
            onCapture={() => handleCapture(key)}
            referencePhotoPath={referencePhotoByShotKey[key] ?? null}
          />
        ))}
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={submitInspection.isPending}
        disabled={submitInspection.isPending || !activeRental?.car_id || !allShotsCaptured}
        style={styles.submitButton}
      >
        {allShotsCaptured ? 'Submit Inspection' : `Take All ${ALL_SHOTS.length} Photos to Continue`}
      </Button>

      <PhotoReviewModal
        visible={!!pendingReview}
        photoUri={pendingReview?.uri ?? null}
        photoBase64={pendingReview?.base64 ?? null}
        photoMimeType={pendingReview?.mimeType ?? null}
        shotKey={pendingReview?.key ?? 'front'}
        label={pendingReview ? SHOT_LABELS[pendingReview.key] : ''}
        carId={activeRental?.car_id ?? null}
        referencePhotoPath={pendingReview ? (referencePhotoByShotKey[pendingReview.key] ?? null) : null}
        onRetake={() => {
          const key = pendingReview?.key
          setPendingReview(null)
          if (key) handleCapture(key)
        }}
        onConfirm={handleConfirm}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: brandColors.paper,
  },
  container: {
    padding: 24,
  },
  heading: {
    marginBottom: 4,
  },
  subheading: {
    opacity: 0.7,
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  shotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
  },
})
