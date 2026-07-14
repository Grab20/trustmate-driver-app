import { useState } from 'react'
import { View, StyleSheet, ScrollView, Image, Alert } from 'react-native'
import { Text, TextInput, Button, IconButton } from 'react-native-paper'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { useActiveRental } from '../../../src/hooks/useActiveRental'
import { useSubmitInspection } from '../../../src/hooks/useInspections'

export default function ReportIncidentScreen() {
  const router = useRouter()
  const { data: activeRental } = useActiveRental()
  const submitInspection = useSubmitInspection()

  const [notes, setNotes] = useState('')
  const [photoUri, setPhotoUri] = useState<string | null>(null)

  async function handleTakePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to take a photo.')
      return
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 })
    if (!result.canceled) setPhotoUri(result.assets[0].uri)
  }

  async function handlePickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Photo library access is required to attach a photo.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 })
    if (!result.canceled) setPhotoUri(result.assets[0].uri)
  }

  async function handleSubmit() {
    if (!activeRental?.car_id || !notes.trim()) return
    try {
      await submitInspection.mutateAsync({
        carId: activeRental.car_id,
        applicationId: activeRental.id,
        odometerKm: null,
        notes,
        photoUris: photoUri ? [photoUri] : [],
        inspectionType: 'incident_report',
      })
      router.back()
    } catch (err) {
      Alert.alert('Submission failed', err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.heading}>
        Report Incident
      </Text>
      <Text variant="bodyMedium" style={styles.subheading}>
        Describe what happened. Your vehicle owner will be notified. Add a photo if you have one.
      </Text>

      {photoUri && (
        <View style={styles.photoPreview}>
          <Image source={{ uri: photoUri }} style={styles.image} />
          <IconButton icon="close-circle" size={20} style={styles.removeButton} onPress={() => setPhotoUri(null)} />
        </View>
      )}

      <View style={styles.actions}>
        <Button mode="outlined" onPress={handleTakePhoto} style={styles.actionButton}>
          Take Photo
        </Button>
        <Button mode="outlined" onPress={handlePickImage} style={styles.actionButton}>
          Upload Photo
        </Button>
      </View>

      <TextInput
        label="What happened?"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={5}
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={submitInspection.isPending}
        disabled={submitInspection.isPending || !activeRental?.car_id || !notes.trim()}
        style={styles.submitButton}
      >
        Submit Report
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
  photoPreview: {
    alignSelf: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  image: {
    width: 160,
    height: 160,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -12,
    right: -12,
    margin: 0,
  },
  actions: {
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
  },
})
