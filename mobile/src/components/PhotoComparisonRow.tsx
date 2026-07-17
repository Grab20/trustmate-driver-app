import { useState } from 'react'
import { View, StyleSheet, Pressable } from 'react-native'
import { Text } from 'react-native-paper'
import { InspectionPhotoThumbnail } from './InspectionPhotoThumbnail'
import { IconBadge } from './IconBadge'
import { DamageOverlayModal } from './DamageOverlayModal'
import type { DamageItem, ShotComparisonStatus } from '../types/inspectionReport'
import { brandColors } from '../theme/theme'

type PhotoComparisonRowProps = {
  label: string
  status: ShotComparisonStatus
  note: string | null
  previousPath: string | null
  previousBucket: 'car-reference-photos' | 'inspection-photos'
  todayPath: string
  damage: DamageItem | null
}

const STATUS_CONFIG: Record<ShotComparisonStatus, { icon: string; color: string; label: string }> = {
  ok: { icon: 'check-circle', color: brandColors.emerald, label: 'No changes' },
  warning: { icon: 'alert-circle', color: '#B5651D', label: 'Possible change detected' },
  no_baseline: { icon: 'help-circle-outline', color: '#8A8A8A', label: 'No baseline to compare yet' },
}

export function PhotoComparisonRow({
  label,
  status,
  note,
  previousPath,
  previousBucket,
  todayPath,
  damage,
}: PhotoComparisonRowProps) {
  const [showOverlay, setShowOverlay] = useState(false)
  const config = STATUS_CONFIG[status]

  return (
    <View style={styles.container}>
      <Text variant="labelLarge" style={styles.label}>
        {label}
      </Text>
      <View style={styles.photosRow}>
        <View style={styles.photoColumn}>
          <Text variant="labelSmall" style={styles.photoCaption}>
            Previous
          </Text>
          {previousPath ? (
            <InspectionPhotoThumbnail path={previousPath} bucket={previousBucket} />
          ) : (
            <View style={styles.emptyThumbnail}>
              <Text variant="bodySmall" style={styles.emptyThumbnailText}>
                N/A
              </Text>
            </View>
          )}
        </View>
        <View style={styles.photoColumn}>
          <Text variant="labelSmall" style={styles.photoCaption}>
            Today
          </Text>
          <InspectionPhotoThumbnail path={todayPath} bucket="inspection-photos" />
        </View>
      </View>
      <View style={styles.statusRow}>
        <IconBadge source={config.icon} size={12} backgroundColor={`${config.color}22`} color={config.color} />
        <Text variant="bodySmall" style={[styles.statusText, { color: config.color }]}>
          {note || config.label}
        </Text>
      </View>
      {damage && (
        <Pressable onPress={() => setShowOverlay(true)}>
          <Text variant="bodySmall" style={styles.viewComparison}>
            View comparison →
          </Text>
        </Pressable>
      )}
      <DamageOverlayModal
        visible={showOverlay}
        onClose={() => setShowOverlay(false)}
        photoPath={todayPath}
        damage={damage}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E3E3DD',
  },
  label: {
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  photosRow: {
    flexDirection: 'row',
    gap: 16,
  },
  photoColumn: {
    alignItems: 'center',
  },
  photoCaption: {
    opacity: 0.6,
    marginBottom: 4,
  },
  emptyThumbnail: {
    width: 96,
    height: 96,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#F4F7F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyThumbnailText: {
    opacity: 0.5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  statusText: {
    fontWeight: '600',
  },
  viewComparison: {
    color: brandColors.emerald,
    fontWeight: '700',
    marginTop: 6,
  },
})
