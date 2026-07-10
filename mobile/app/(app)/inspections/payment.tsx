import { useState } from 'react'
import { View, StyleSheet, ScrollView, Image, Alert } from 'react-native'
import { Text, TextInput, Button, IconButton } from 'react-native-paper'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { useRouter } from 'expo-router'
import { useActiveRental } from '../../../src/hooks/useActiveRental'
import { useSubmitInspection } from '../../../src/hooks/useInspections'

type Attachment = { uri: string; isPdf: boolean; name: string }

export default function ProofOfPaymentScreen() {
  const router = useRouter()
  const { data: activeRental } = useActiveRental()
  const submitInspection = useSubmitInspection()

  const [notes, setNotes] = useState('')
  const [attachment, setAttachment] = useState<Attachment | null>(null)

  async function handleTakePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to take a photo.')
      return
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 })
    if (!result.canceled) {
      setAttachment({ uri: result.assets[0].uri, isPdf: false, name: 'Photo' })
    }
  }

  async function handlePickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Photo library access is required to attach a screenshot.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 })
    if (!result.canceled) {
      setAttachment({ uri: result.assets[0].uri, isPdf: false, name: 'Image' })
    }
  }

  async function handlePickPdf() {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' })
    if (!result.canceled) {
      setAttachment({ uri: result.assets[0].uri, isPdf: true, name: result.assets[0].name })
    }
  }

  async function handleSubmit() {
    if (!activeRental?.car_id || !attachment) return
    try {
      await submitInspection.mutateAsync({
        carId: activeRental.car_id,
        applicationId: activeRental.id,
        odometerKm: null,
        notes,
        photoUris: [attachment.uri],
        inspectionType: 'proof_of_payment',
      })
      router.back()
    } catch (err) {
      Alert.alert('Submission failed', err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.heading}>
        Proof of Payment
      </Text>
      <Text variant="bodyMedium" style={styles.subheading}>
        Attach a photo, screenshot, or PDF of your payment receipt for your vehicle owner to
        review.
      </Text>

      {attachment && (
        <View style={styles.attachmentPreview}>
          {attachment.isPdf ? (
            <View style={styles.pdfPreview}>
              <IconButton icon="file-pdf-box" size={40} />
              <Text variant="bodyMedium" numberOfLines={1}>
                {attachment.name}
              </Text>
            </View>
          ) : (
            <Image source={{ uri: attachment.uri }} style={styles.imagePreview} />
          )}
          <IconButton
            icon="close-circle"
            size={20}
            style={styles.removeButton}
            onPress={() => setAttachment(null)}
          />
        </View>
      )}

      <View style={styles.actions}>
        <Button mode="outlined" onPress={handleTakePhoto} style={styles.actionButton}>
          Take Photo
        </Button>
        <Button mode="outlined" onPress={handlePickImage} style={styles.actionButton}>
          Upload Image
        </Button>
        <Button mode="outlined" onPress={handlePickPdf} style={styles.actionButton}>
          Attach PDF
        </Button>
      </View>

      <TextInput
        label="Notes (optional)"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={submitInspection.isPending}
        disabled={submitInspection.isPending || !activeRental?.car_id || !attachment}
        style={styles.submitButton}
      >
        Submit Proof of Payment
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
  attachmentPreview: {
    alignSelf: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  imagePreview: {
    width: 160,
    height: 160,
    borderRadius: 8,
  },
  pdfPreview: {
    width: 160,
    height: 160,
    borderRadius: 8,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
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
