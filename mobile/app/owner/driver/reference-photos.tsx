import { useMemo, useState } from 'react'
import { View, StyleSheet, ScrollView, Alert, Pressable } from 'react-native'
import { Text, Button, ActivityIndicator } from 'react-native-paper'
import * as ImagePicker from 'expo-image-picker'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCar } from '../../../src/hooks/useCar'
import { useCarReferencePhotos, useSubmitReferencePhotos } from '../../../src/hooks/useCarReferencePhotos'
import { supabase } from '../../../src/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import { ReferencePhotoSlot } from '../../../src/components/ReferencePhotoSlot'
import { InspectionProgress } from '../../../src/components/InspectionProgress'
import { SectionLabel } from '../../../src/components/SectionLabel'
import { DamageOverlayModal } from '../../../src/components/DamageOverlayModal'
import {
  EXTERIOR_SHOT_KEYS,
  INTERIOR_SHOT_KEYS,
  SHOT_LABELS,
  type InspectionShotKey,
} from '../../../src/components/InspectionShotGuide'
import { LoadingScreen } from '../../../src/components/LoadingScreen'
import { brandColors, radius } from '../../../src/theme/theme'
import type { DamageItem } from '../../../src/types/inspectionReport'
import type { Json } from '../../../src/types/database'

const ALL_SHOTS: InspectionShotKey[] = [...EXTERIOR_SHOT_KEYS, ...INTERIOR_SHOT_KEYS]

function parseDamage(raw: Json, shotKey: InspectionShotKey): DamageItem[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item) => ({ ...(item as Omit<DamageItem, 'shot'>), shot: shotKey }))
}

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

  const damageByShotKey = useMemo(() => {
    const map: Partial<Record<InspectionShotKey, DamageItem[]>> = {}
    for (const row of existingPhotos ?? []) {
      const items = parseDamage(row.damage, row.shot_key as InspectionShotKey)
      if (items.length > 0) map[row.shot_key as InspectionShotKey] = items
    }
    return map
  }, [existingPhotos])

  const allDamage = useMemo(() => Object.values(damageByShotKey).flat(), [damageByShotKey])
  const analyzedCount = (existingPhotos ?? []).filter((row) => row.analyzed_at).length
  const capturedShotCount = (existingPhotos ?? []).length

  const [uploadingKey, setUploadingKey] = useState<InspectionShotKey | null>(null)
  const [selectedDamage, setSelectedDamage] = useState<DamageItem | null>(null)
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false)
  const capturedCount = ALL_SHOTS.filter((key) => localUris[key] || existingByShotKey[key]).length
  const allShotsCaptured = capturedCount === ALL_SHOTS.length
  const queryClient = useQueryClient()

  async function handleAnalyzeForDamage() {
    if (!carId || capturedShotCount === 0) return
    setIsRunningAnalysis(true)
    try {
      await Promise.all(
        (existingPhotos ?? []).map((row) =>
          supabase.functions.invoke('analyze-reference-photo', { body: { carId, shotKey: row.shot_key } }).catch(() => {}),
        ),
      )
      await queryClient.invalidateQueries({ queryKey: ['car-reference-photos', carId] })
    } finally {
      setIsRunningAnalysis(false)
    }
  }

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
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
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
            damageCount={damageByShotKey[key]?.length ?? 0}
            onViewDamage={() => setSelectedDamage(damageByShotKey[key]?.[0] ?? null)}
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
            damageCount={damageByShotKey[key]?.length ?? 0}
            onViewDamage={() => setSelectedDamage(damageByShotKey[key]?.[0] ?? null)}
          />
        ))}
      </View>

      {capturedShotCount > 0 && (
        <>
          <SectionLabel icon="magnify-scan" label="CONDITION REPORT" />
          <View style={styles.reportCard}>
            <View style={styles.reportHeaderRow}>
              <Text variant="bodySmall" style={styles.analyzingText}>
                {analyzedCount} of {capturedShotCount} photos scanned
              </Text>
              <Button mode="text" compact onPress={handleAnalyzeForDamage} loading={isRunningAnalysis} disabled={isRunningAnalysis}>
                {analyzedCount < capturedShotCount ? 'Analyze for Damage' : 'Re-scan'}
              </Button>
            </View>
            {isRunningAnalysis && (
              <View style={styles.analyzingRow}>
                <ActivityIndicator size="small" color={brandColors.emerald} />
                <Text variant="bodySmall" style={styles.analyzingText}>
                  Scanning photos for dents and scratches…
                </Text>
              </View>
            )}
            {allDamage.length === 0 && !isRunningAnalysis ? (
              <Text variant="bodyMedium" style={styles.reportEmpty}>
                {analyzedCount === 0
                  ? 'Not scanned yet — tap "Analyze for Damage" to check these photos.'
                  : 'No damage detected — the car looks clean in every photo scanned so far.'}
              </Text>
            ) : (
              allDamage.map((item, index) => (
                <Pressable key={index} onPress={() => setSelectedDamage(item)} style={styles.damageRow}>
                  <View style={styles.damageDot} />
                  <View style={styles.damageRowText}>
                    <Text variant="bodyMedium" style={styles.damageRowTitle}>
                      {item.type} — {SHOT_LABELS[item.shot]}
                    </Text>
                    <Text variant="bodySmall" style={styles.damageRowDetail}>
                      {item.description || item.location}
                    </Text>
                  </View>
                  <Text variant="bodySmall" style={styles.damageRowTap}>
                    View →
                  </Text>
                </Pressable>
              ))
            )}
          </View>
        </>
      )}

      <Button mode="contained" onPress={() => router.back()} style={styles.saveButton}>
        {allShotsCaptured ? 'Done' : `Done (${capturedCount}/${ALL_SHOTS.length} captured)`}
      </Button>

      <DamageOverlayModal
        visible={!!selectedDamage}
        onClose={() => setSelectedDamage(null)}
        photoPath={selectedDamage ? (existingByShotKey[selectedDamage.shot] ?? null) : null}
        damage={selectedDamage}
        bucket="car-reference-photos"
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
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 16,
  },
  reportHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  analyzingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  analyzingText: {
    opacity: 0.7,
  },
  reportEmpty: {
    opacity: 0.7,
    textAlign: 'center',
    paddingVertical: 8,
  },
  damageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brandColors.line,
  },
  damageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: brandColors.alert,
  },
  damageRowText: {
    flex: 1,
  },
  damageRowTitle: {
    fontWeight: '700',
  },
  damageRowDetail: {
    opacity: 0.7,
    marginTop: 2,
  },
  damageRowTap: {
    color: brandColors.emerald,
    fontWeight: '600',
  },
})
