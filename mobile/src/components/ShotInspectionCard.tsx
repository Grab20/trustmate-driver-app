import { useState } from 'react'
import { View, StyleSheet, Pressable } from 'react-native'
import { Text } from 'react-native-paper'
import { InspectionPhotoThumbnail } from './InspectionPhotoThumbnail'
import { IconBadge } from './IconBadge'
import { DamageOverlayModal } from './DamageOverlayModal'
import type { ComponentFinding, FindingSeverity } from '../types/inspectionReport'
import { brandColors, radius } from '../theme/theme'

type ShotInspectionCardProps = {
  label: string
  hasBaseline: boolean
  overallMatchPercent: number | null
  components: ComponentFinding[]
  previousPath: string | null
  previousBucket: 'car-reference-photos' | 'inspection-photos'
  todayPath: string
}

function matchColor(percent: number): string {
  if (percent >= 85) return brandColors.emerald
  if (percent >= 60) return '#B5651D'
  return brandColors.alert
}

// Red = major (structural/safety), Orange = minor (cosmetic), Yellow = dirty
// (cleanliness) — matches the bounding-box colour key shown in DamageOverlayModal.
function severityColor(severity: FindingSeverity | null): string {
  if (severity === 'minor') return '#C2701A'
  if (severity === 'dirty') return '#B8960C'
  return brandColors.alert
}

function severityBackgroundColor(severity: FindingSeverity | null): string {
  if (severity === 'minor') return '#FCEEE0'
  if (severity === 'dirty') return '#FBF3D9'
  return '#FDEDEC'
}

export function ShotInspectionCard({
  label,
  hasBaseline,
  overallMatchPercent,
  components,
  previousPath,
  previousBucket,
  todayPath,
}: ShotInspectionCardProps) {
  const [selectedFinding, setSelectedFinding] = useState<ComponentFinding | null>(null)

  const newFindings = components.filter((c) => c.status === 'new_finding')
  const verified = components.filter((c) => c.status === 'verified')
  const unableToVerify = components.filter((c) => c.status === 'unable_to_verify')

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text variant="labelLarge" style={styles.label}>
          {label}
        </Text>
        {overallMatchPercent != null && (
          <View style={[styles.matchPill, { backgroundColor: `${matchColor(overallMatchPercent)}1A` }]}>
            <Text variant="labelSmall" style={[styles.matchPillText, { color: matchColor(overallMatchPercent) }]}>
              {hasBaseline ? 'Overall Match' : 'Capture Confidence'} {overallMatchPercent}%
            </Text>
          </View>
        )}
      </View>

      <View style={styles.photosRow}>
        <View style={styles.photoColumn}>
          <Text variant="labelSmall" style={styles.photoCaption}>
            {hasBaseline ? 'Baseline' : 'N/A'}
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

      {newFindings.length > 0 && (
        <View style={styles.section}>
          <Text variant="labelSmall" style={[styles.sectionLabel, styles.sectionLabelAlert]}>
            NEW FINDINGS
          </Text>
          {newFindings.map((finding, index) => {
            const color = severityColor(finding.severity)
            return (
              <Pressable
                key={index}
                onPress={() => setSelectedFinding(finding)}
                style={[styles.findingRow, { backgroundColor: severityBackgroundColor(finding.severity) }]}
              >
                <IconBadge source="alert" size={11} backgroundColor="transparent" color={color} />
                <View style={styles.findingTextColumn}>
                  <View style={styles.findingTitleRow}>
                    <Text variant="bodyMedium" style={[styles.findingTitle, { color }]}>
                      {finding.findingType ?? 'Finding'} — {finding.component}
                    </Text>
                    {finding.severity && (
                      <View style={[styles.severityPill, { backgroundColor: color }]}>
                        <Text variant="labelSmall" style={styles.severityPillText}>
                          {finding.severity === 'dirty' ? 'Dirty' : finding.severity === 'major' ? 'Major' : 'Minor'}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text variant="bodySmall" style={styles.findingDescription}>
                    {finding.description}
                  </Text>
                  <Text variant="labelSmall" style={[styles.findingConfidence, { color }]}>
                    Confidence: {finding.confidencePercent}%{finding.boundingBox ? ' · Tap to view' : ''}
                  </Text>
                </View>
              </Pressable>
            )
          })}
        </View>
      )}

      {verified.length > 0 && (
        <View style={styles.section}>
          <Text variant="labelSmall" style={styles.sectionLabel}>
            VERIFIED
          </Text>
          {verified.map((finding, index) => (
            <View key={index} style={styles.checkRow}>
              <IconBadge source="check" size={10} backgroundColor="transparent" color={brandColors.emerald} />
              <Text variant="bodySmall" style={styles.checkText}>
                <Text style={styles.checkComponent}>{finding.component}: </Text>
                {finding.description}
              </Text>
            </View>
          ))}
        </View>
      )}

      {unableToVerify.length > 0 && (
        <View style={styles.section}>
          <Text variant="labelSmall" style={[styles.sectionLabel, styles.sectionLabelMuted]}>
            UNABLE TO VERIFY
          </Text>
          {unableToVerify.map((finding, index) => (
            <View key={index} style={styles.checkRow}>
              <IconBadge source="help-circle-outline" size={10} backgroundColor="transparent" color="#8A8A8A" />
              <Text variant="bodySmall" style={styles.mutedText}>
                <Text style={styles.checkComponent}>{finding.component}: </Text>
                {finding.description}
              </Text>
            </View>
          ))}
        </View>
      )}

      {newFindings.length === 0 && verified.length === 0 && unableToVerify.length === 0 && (
        <Text variant="bodySmall" style={styles.mutedText}>
          No components could be assessed from this photo.
        </Text>
      )}

      <DamageOverlayModal
        visible={!!selectedFinding}
        onClose={() => setSelectedFinding(null)}
        photoPath={todayPath}
        damage={
          selectedFinding
            ? {
                shot: selectedFinding.shot,
                location: selectedFinding.component,
                type: selectedFinding.findingType ?? 'Finding',
                confidencePercent: selectedFinding.confidencePercent,
                estimatedSizeCm: null,
                description: selectedFinding.description,
                boundingBox: selectedFinding.boundingBox,
                severity: selectedFinding.severity,
              }
            : null
        }
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    letterSpacing: 0.5,
  },
  matchPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  matchPillText: {
    fontWeight: '700',
  },
  photosRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
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
  section: {
    marginTop: 10,
  },
  sectionLabel: {
    color: brandColors.emerald,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  sectionLabelAlert: {
    color: brandColors.alert,
  },
  sectionLabelMuted: {
    color: '#8A8A8A',
  },
  findingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
    padding: 10,
    borderRadius: radius.md,
    backgroundColor: '#FDEDEC',
  },
  findingTextColumn: {
    flex: 1,
  },
  findingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  findingTitle: {
    fontWeight: '700',
  },
  severityPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  severityPillText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  findingDescription: {
    marginTop: 2,
    opacity: 0.8,
  },
  findingConfidence: {
    marginTop: 4,
    opacity: 0.8,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  checkText: {
    flex: 1,
    opacity: 0.85,
  },
  checkComponent: {
    fontWeight: '700',
  },
  mutedText: {
    flex: 1,
    opacity: 0.6,
  },
})
