import { useState } from 'react'
import { View, StyleSheet, ScrollView, Alert } from 'react-native'
import { Text, TextInput, Button } from 'react-native-paper'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { useActiveRental } from '../../../../src/hooks/useActiveRental'
import { useVehicleOdometer } from '../../../../src/hooks/useVehicleOdometer'
import { useSubmitInspection } from '../../../../src/hooks/useInspections'
import { PhotoSlot } from '../../../../src/components/PhotoSlot'
import { InspectionProgress } from '../../../../src/components/InspectionProgress'
import { PhotoReviewModal } from '../../../../src/components/PhotoReviewModal'

// Order matters: photo_urls is a plain array, and this order is the convention
// used to interpret which shot is which when displaying an inspection later.
const REQUIRED_SHOTS = [
  { key: 'front', label: 'Front' },
  { key: 'back', label: 'Back' },
  { key: 'left', label: 'Left Side' },
  { key: 'right', label: 'Right Side' },
  { key: 'interior', label: 'Interior' },
  { key: 'dashboard', label: 'Dashboard' },
] as const

type ShotKey = (typeof REQUIRED_SHOTS)[number]['key']

export default function NewInspectionScreen() {
  const router = useRouter()
  const { data: activeRental } = useActiveRental()
  const { data: odometer } = useVehicleOdometer(activeRental?.car_id ?? undefined)
  const submitInspection = useSubmitInspection()

  const [odometerKm, setOdometerKm] = useState(
    odometer?.current_km != null ? String(odometer.current_km) : '',
  )
  const [notes, setNotes] = useState('')
  const [shots, setShots] = useState<Record<ShotKey, string | null>>({
    front: null,
    back: null,
    left: null,
    right: null,
    interior: null,
    dashboard: null,
  })
  const [pendingReview, setPendingReview] = useState<{ key: ShotKey; uri: string } | null>(null)

  const capturedCount = REQUIRED_SHOTS.filter((shot) => shots[shot.key] !== null).length
  const allShotsCaptured = capturedCount === REQUIRED_SHOTS.length

  async function handleCapture(key: ShotKey) {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to take inspection photos.')
      return
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 })
    if (!result.canceled) {
      setPendingReview({ key, uri: result.assets[0].uri })
    }
  }

  async function handleSubmit() {
    if (!activeRental?.car_id || !allShotsCaptured) return
    try {
      await submitInspection.mutateAsync({
        carId: activeRental.car_id,
        applicationId: activeRental.id,
        odometerKm: odometerKm.trim() ? Number(odometerKm) : null,
        notes,
        photoUris: REQUIRED_SHOTS.map((shot) => shots[shot.key] as string),
      })
      router.back()
    } catch (err) {
      Alert.alert('Submission failed', err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.heading}>
        Vehicle Inspection
      </Text>
      <Text variant="bodyMedium" style={styles.subheading}>
        Take all 6 photos using your camera so your vehicle owner can review the car's condition.
      </Text>

      <InspectionProgress completed={capturedCount} total={REQUIRED_SHOTS.length} />

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

      <View style={styles.shotsGrid}>
        {REQUIRED_SHOTS.map((shot) => (
          <PhotoSlot
            key={shot.key}
            label={shot.label}
            shotKey={shot.key}
            uri={shots[shot.key]}
            onCapture={() => handleCapture(shot.key)}
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
        {allShotsCaptured ? 'Submit Inspection' : 'Take All 6 Photos to Continue'}
      </Button>

      <PhotoReviewModal
        visible={!!pendingReview}
        photoUri={pendingReview?.uri ?? null}
        shotKey={pendingReview?.key ?? 'front'}
        label={REQUIRED_SHOTS.find((shot) => shot.key === pendingReview?.key)?.label ?? ''}
        onRetake={() => {
          const key = pendingReview?.key
          setPendingReview(null)
          if (key) handleCapture(key)
        }}
        onConfirm={() => {
          if (pendingReview) {
            setShots((prev) => ({ ...prev, [pendingReview.key]: pendingReview.uri }))
          }
          setPendingReview(null)
        }}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
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
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 8,
  },
})
