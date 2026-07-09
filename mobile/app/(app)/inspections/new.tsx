import { useState } from 'react'
import { View, StyleSheet, ScrollView, Image, Alert } from 'react-native'
import { Text, TextInput, Button, IconButton } from 'react-native-paper'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { useActiveRental } from '../../../src/hooks/useActiveRental'
import { useVehicleOdometer } from '../../../src/hooks/useVehicleOdometer'
import { useSubmitInspection } from '../../../src/hooks/useInspections'

export default function NewInspectionScreen() {
  const router = useRouter()
  const { data: activeRental } = useActiveRental()
  const { data: odometer } = useVehicleOdometer(activeRental?.car_id ?? undefined)
  const submitInspection = useSubmitInspection()

  const [odometerKm, setOdometerKm] = useState(
    odometer?.current_km != null ? String(odometer.current_km) : '',
  )
  const [notes, setNotes] = useState('')
  const [photoUris, setPhotoUris] = useState<string[]>([])

  async function handlePickPhotos() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Photo library access is required to attach photos.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.7,
    })
    if (!result.canceled) {
      setPhotoUris((prev) => [...prev, ...result.assets.map((a) => a.uri)])
    }
  }

  async function handleTakePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to take a photo.')
      return
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 })
    if (!result.canceled) {
      setPhotoUris((prev) => [...prev, ...result.assets.map((a) => a.uri)])
    }
  }

  function removePhoto(uri: string) {
    setPhotoUris((prev) => prev.filter((p) => p !== uri))
  }

  async function handleSubmit() {
    if (!activeRental?.car_id) return
    try {
      await submitInspection.mutateAsync({
        carId: activeRental.car_id,
        applicationId: activeRental.id,
        odometerKm: odometerKm.trim() ? Number(odometerKm) : null,
        notes,
        photoUris,
      })
      router.back()
    } catch (err) {
      Alert.alert('Submission failed', err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.heading}>
        Weekly Check-In
      </Text>
      <Text variant="bodyMedium" style={styles.subheading}>
        Submit a photo and odometer reading for your vehicle owner to review.
      </Text>

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
        numberOfLines={4}
        style={styles.input}
      />

      <View style={styles.photoRow}>
        {photoUris.map((uri) => (
          <View key={uri} style={styles.photoWrapper}>
            <Image source={{ uri }} style={styles.photo} />
            <IconButton
              icon="close-circle"
              size={20}
              style={styles.removeButton}
              onPress={() => removePhoto(uri)}
            />
          </View>
        ))}
      </View>

      <View style={styles.photoActions}>
        <Button mode="outlined" onPress={handleTakePhoto} style={styles.photoActionButton}>
          Take Photo
        </Button>
        <Button mode="outlined" onPress={handlePickPhotos} style={styles.photoActionButton}>
          Choose Photos
        </Button>
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={submitInspection.isPending}
        disabled={submitInspection.isPending || !activeRental?.car_id}
        style={styles.submitButton}
      >
        Submit Check-In
      </Button>
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
  photoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  photoWrapper: {
    position: 'relative',
    marginRight: 8,
    marginBottom: 8,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -12,
    right: -12,
    margin: 0,
  },
  photoActions: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  photoActionButton: {
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    marginTop: 8,
  },
})
