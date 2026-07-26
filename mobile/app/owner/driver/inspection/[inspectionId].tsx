import { useMemo, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { ScrollView, View, StyleSheet, Alert, Pressable } from 'react-native'
import { Text, Card, Button, TextInput, Chip } from 'react-native-paper'
import {
  useInspectionReport,
  useWeeklyInspectionsForCar,
  useReviewInspection,
  useRetryPendingAnalysis,
} from '../../../../src/hooks/useInspections'
import { useCar } from '../../../../src/hooks/useCar'
import { useCarReferencePhotos } from '../../../../src/hooks/useCarReferencePhotos'
import { LoadingScreen } from '../../../../src/components/LoadingScreen'
import { SectionLabel } from '../../../../src/components/SectionLabel'
import { IconBadge } from '../../../../src/components/IconBadge'
import { ShotInspectionCard } from '../../../../src/components/ShotInspectionCard'
import { DamageOverlayModal } from '../../../../src/components/DamageOverlayModal'
import { EXTERIOR_SHOT_KEYS, INTERIOR_SHOT_KEYS, SHOT_LABELS, type InspectionShotKey } from '../../../../src/components/InspectionShotGuide'
import { isVehicleHealthReport, type ComponentFinding } from '../../../../src/types/inspectionReport'
import { brandColors } from '../../../../src/theme/theme'
import type { Tables } from '../../../../src/types/database'

const ALL_SHOTS = [...EXTERIOR_SHOT_KEYS, ...INTERIOR_SHOT_KEYS]

const VERIFICATION_ROWS: { key: 'plateMatch' | 'colorMatch' | 'modelMatch' | 'interiorMatch' | 'dashboardMatch'; label: string }[] = [
  { key: 'plateMatch', label: 'Registration Plate' },
  { key: 'colorMatch', label: 'Vehicle Colour' },
  { key: 'modelMatch', label: 'Vehicle Model' },
  { key: 'interiorMatch', label: 'Interior' },
  { key: 'dashboardMatch', label: 'Dashboard' },
]

const STATUS_AFTER_DECISION: Record<string, { label: string; color: string; icon: string }> = {
  approved: { label: 'Inspection Approved', color: brandColors.emerald, icon: 'check-circle' },
  reinspection_requested: { label: 'Re-inspection Requested', color: '#B5651D', icon: 'refresh-circle' },
  flagged: { label: 'Damage Flagged', color: brandColors.alert, icon: 'flag' },
  declined: { label: 'Inspection Declined', color: brandColors.alert, icon: 'close-circle' },
}

function computeDriverRecord(inspections: Tables<'vehicle_inspections'>[]) {
  const withQuality = inspections.filter((i) => isVehicleHealthReport(i.ai_analysis))
  const avgQuality =
    withQuality.length > 0
      ? Math.round(
          withQuality.reduce((sum, i) => sum + (isVehicleHealthReport(i.ai_analysis) ? i.ai_analysis.quality.percent : 0), 0) /
            withQuality.length,
        )
      : null

  let onTimeCount = 0
  for (let i = 0; i < inspections.length; i++) {
    if (i === 0) {
      onTimeCount++
      continue
    }
    const gapDays =
      (new Date(inspections[i].created_at ?? '').getTime() - new Date(inspections[i - 1].created_at ?? '').getTime()) /
      (1000 * 60 * 60 * 24)
    if (gapDays <= 8) onTimeCount++
  }
  const onTimePercent = inspections.length > 0 ? Math.round((onTimeCount / inspections.length) * 100) : null

  const careRating =
    avgQuality == null ? 'Not enough data' : avgQuality >= 90 ? 'Excellent' : avgQuality >= 75 ? 'Good' : avgQuality >= 60 ? 'Fair' : 'Needs Improvement'

  return { completed: inspections.length, onTimePercent, avgQuality, careRating }
}

export default function InspectionHealthReportScreen() {
  const { inspectionId, driverId, carId } = useLocalSearchParams<{ inspectionId: string; driverId: string; carId: string }>()
  const { data: inspection, isLoading: isInspectionLoading } = useInspectionReport(inspectionId)
  const { data: car } = useCar(carId || undefined)
  const { data: weeklyInspections, isLoading: isHistoryLoading } = useWeeklyInspectionsForCar(carId || undefined, driverId || undefined)
  const { data: referencePhotos } = useCarReferencePhotos(carId || undefined)
  const reviewInspection = useReviewInspection(driverId || undefined)

  const [comment, setComment] = useState('')
  const [showFlagOptions, setShowFlagOptions] = useState(false)
  const [selectedFinding, setSelectedFinding] = useState<ComponentFinding | null>(null)

  const referenceByShotKey = useMemo(() => {
    const map: Partial<Record<string, string>> = {}
    for (const row of referencePhotos ?? []) map[row.shot_key] = row.photo_path
    return map
  }, [referencePhotos])

  const inspectionNumber = useMemo(() => {
    if (!weeklyInspections || !inspection) return null
    const index = weeklyInspections.findIndex((i) => i.id === inspection.id)
    return index === -1 ? null : index + 1
  }, [weeklyInspections, inspection])

  const previousInspection = useMemo(() => {
    if (!weeklyInspections || !inspection) return null
    const index = weeklyInspections.findIndex((i) => i.id === inspection.id)
    if (index <= 0) return null
    return weeklyInspections[index - 1]
  }, [weeklyInspections, inspection])

  const driverRecord = useMemo(() => computeDriverRecord(weeklyInspections ?? []), [weeklyInspections])

  useRetryPendingAnalysis(inspection)

  if (isInspectionLoading || isHistoryLoading || !inspection) return <LoadingScreen />

  const currentInspectionId = inspection.id
  const report = isVehicleHealthReport(inspection.ai_analysis) ? inspection.ai_analysis : null
  const reviewStatus = inspection.owner_review_status ?? 'pending'
  const canReview = reviewStatus === 'pending'
  const afterDecisionConfig = STATUS_AFTER_DECISION[reviewStatus]

  function photoPathForShot(shotKey: InspectionShotKey): string {
    const index = ALL_SHOTS.indexOf(shotKey)
    return inspection?.photo_urls?.[index] ?? ''
  }

  function previousPathForShot(shotKeyIndex: number, shotKey: string): { path: string | null; bucket: 'car-reference-photos' | 'inspection-photos' } {
    if (report?.comparedAgainst === 'previous_inspection' && previousInspection?.photo_urls) {
      return { path: previousInspection.photo_urls[shotKeyIndex] ?? null, bucket: 'inspection-photos' }
    }
    if (report?.comparedAgainst === 'reference_photos') {
      return { path: referenceByShotKey[shotKey] ?? null, bucket: 'car-reference-photos' }
    }
    return { path: null, bucket: 'inspection-photos' }
  }

  function handleDecision(status: 'approved' | 'reinspection_requested' | 'flagged', flagReason?: 'existing_damage' | 'false_detection') {
    reviewInspection.mutate(
      { inspectionId: currentInspectionId, status, comment, flagReason },
      {
        onError: (err) => Alert.alert('Failed to submit decision', err instanceof Error ? err.message : 'Unknown error'),
      },
    )
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text variant="bodySmall" style={styles.vehicleName}>
        {car ? `${car.make} ${car.model}` : 'Vehicle'}
      </Text>
      <Text variant="titleLarge" style={styles.heading}>
        {inspectionNumber ? `Inspection #${inspectionNumber}` : 'Inspection'}
      </Text>
      <Text variant="bodySmall" style={styles.date}>
        {inspection.created_at ? new Date(inspection.created_at).toLocaleString() : ''}
      </Text>

      {report ? (
        <>
          <Card style={[styles.card, styles.healthCard]}>
            <Card.Content style={styles.healthCardContent}>
              <SectionLabel icon="heart-pulse" label="VEHICLE HEALTH" />
              <Text variant="displaySmall" style={styles.healthScore}>
                {report.healthScore} <Text variant="titleMedium">/ 100</Text>
              </Text>
              <Text variant="titleMedium" style={[styles.healthLabel, report.healthScore < 90 && styles.healthLabelWarn]}>
                {report.healthLabel}
              </Text>
              <Text variant="bodySmall" style={styles.healthSubtext}>
                {report.comparedAgainst === 'previous_inspection'
                  ? 'Compared against the previous inspection.'
                  : report.comparedAgainst === 'reference_photos'
                    ? "Compared against the owner's reference photos (first inspection)."
                    : 'No baseline was available for comparison yet.'}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <SectionLabel icon="robot-outline" label="AI SUMMARY" />
              {report.summary.map((bullet, index) => (
                <View key={index} style={styles.summaryRow}>
                  <IconBadge
                    source={bullet.ok ? 'check' : 'alert'}
                    size={12}
                    backgroundColor="transparent"
                    color={bullet.ok ? brandColors.emerald : '#B5651D'}
                  />
                  <Text variant="bodyMedium" style={[styles.summaryText, !bullet.ok && styles.summaryTextWarn]}>
                    {bullet.text}
                  </Text>
                </View>
              ))}
            </Card.Content>
          </Card>

          {report.newFindings.length > 0 && (
            <>
              <SectionLabel icon="alert-decagram-outline" label="NEW FINDINGS" />
              {report.newFindings.map((item, index) => (
                <Pressable key={index} onPress={() => setSelectedFinding(item)}>
                  <Card style={[styles.card, styles.damageCard]}>
                    <Card.Content>
                      <Text variant="titleMedium" style={styles.damageTitle}>
                        {item.findingType ?? 'Finding'} — {item.component}
                      </Text>
                      <Text variant="bodyMedium" style={styles.detail}>
                        {SHOT_LABELS[item.shot]} · Confidence: {item.confidencePercent}%
                      </Text>
                      <Text variant="bodySmall" style={styles.damageDescription}>
                        {item.description}
                      </Text>
                    </Card.Content>
                  </Card>
                </Pressable>
              ))}
            </>
          )}

          {report.unableToVerify.length > 0 && (
            <>
              <SectionLabel icon="help-circle-outline" label="UNABLE TO VERIFY" />
              <Card style={styles.card}>
                <Card.Content>
                  {report.unableToVerify.map((item, index) => (
                    <View key={index} style={styles.summaryRow}>
                      <IconBadge source="help-circle-outline" size={12} backgroundColor="transparent" color="#8A8A8A" />
                      <Text variant="bodyMedium" style={styles.summaryText}>
                        {SHOT_LABELS[item.shot]} — {item.component}: {item.description}
                      </Text>
                    </View>
                  ))}
                </Card.Content>
              </Card>
            </>
          )}

          <SectionLabel icon="image-multiple-outline" label="COMPONENT-BY-COMPONENT INSPECTION" />
          <Card style={styles.card}>
            <Card.Content>
              {ALL_SHOTS.map((shotKey, index) => {
                const { path, bucket } = previousPathForShot(index, shotKey)
                const shotResult = report.shots.find((s) => s.shot === shotKey)
                return (
                  <ShotInspectionCard
                    key={shotKey}
                    label={SHOT_LABELS[shotKey]}
                    hasBaseline={shotResult?.hasBaseline ?? false}
                    overallMatchPercent={shotResult?.overallMatchPercent ?? null}
                    components={shotResult?.components ?? []}
                    previousPath={path}
                    previousBucket={bucket}
                    todayPath={inspection.photo_urls?.[index] ?? ''}
                  />
                )
              })}
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <SectionLabel icon="shield-search" label="VEHICLE VERIFICATION" />
              {VERIFICATION_ROWS.map((row) => {
                const value = report.verification[row.key]
                return (
                  <View key={row.key} style={styles.verificationRow}>
                    <Text variant="bodyMedium">{row.label}</Text>
                    <View style={styles.verificationBadge}>
                      <IconBadge
                        source={value === true ? 'check' : value === false ? 'close' : 'minus'}
                        size={11}
                        backgroundColor="transparent"
                        color={value === true ? brandColors.emerald : value === false ? brandColors.alert : '#8A8A8A'}
                      />
                      <Text variant="bodySmall" style={styles.verificationText}>
                        {value === true ? 'Match' : value === false ? 'Mismatch' : 'N/A'}
                      </Text>
                    </View>
                  </View>
                )
              })}
              {report.verification.detectedPlateNumber && (
                <Text variant="bodySmall" style={styles.detail}>
                  Detected plate: {report.verification.detectedPlateNumber}
                </Text>
              )}
              <Text variant="bodySmall" style={styles.verificationNote}>
                {report.verification.note}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <SectionLabel icon="star-outline" label="INSPECTION QUALITY" />
              <Text variant="titleLarge" style={styles.stars}>
                {'★'.repeat(report.quality.starRating)}
                {'☆'.repeat(5 - report.quality.starRating)}
              </Text>
              <View style={styles.qualityGrid}>
                <Text variant="bodySmall" style={styles.detail}>
                  Image Sharpness: {report.quality.sharpness}
                </Text>
                <Text variant="bodySmall" style={styles.detail}>
                  Lighting: {report.quality.lighting}
                </Text>
                <Text variant="bodySmall" style={styles.detail}>
                  Coverage: {report.quality.coverage}
                </Text>
                <Text variant="bodySmall" style={styles.detail}>
                  Angles: {report.quality.angles}
                </Text>
              </View>
              <Text variant="titleMedium" style={styles.qualityPercent}>
                {report.quality.percent}%
              </Text>
            </Card.Content>
          </Card>
        </>
      ) : (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="bodyMedium" style={styles.detail}>
              {inspection.ai_analyzed_at ? 'AI review unavailable for this inspection.' : 'AI review in progress…'}
            </Text>
          </Card.Content>
        </Card>
      )}

      <SectionLabel icon="history" label="VEHICLE HISTORY" />
      <Card style={styles.card}>
        <Card.Content>
          {(weeklyInspections ?? []).map((item, index) => {
            const itemReport = isVehicleHealthReport(item.ai_analysis) ? item.ai_analysis : null
            const isCurrent = item.id === inspection.id
            const label = !itemReport
              ? item.ai_analyzed_at != null
                ? 'AI review unavailable'
                : 'Awaiting AI review'
              : itemReport.newFindings.length > 0
                ? `${itemReport.newFindings.length} new ${itemReport.newFindings.length === 1 ? 'finding' : 'findings'}${item.owner_review_status === 'pending' ? ' — awaiting owner review' : ''}`
                : 'No new findings'
            return (
              <View key={item.id} style={styles.historyRow}>
                <IconBadge
                  source={!itemReport ? 'clock-outline' : itemReport.newFindings.length > 0 ? 'alert' : 'check'}
                  size={11}
                  backgroundColor="transparent"
                  color={!itemReport ? '#8A8A8A' : itemReport.newFindings.length > 0 ? '#B5651D' : brandColors.emerald}
                />
                <Text variant="bodyMedium" style={[styles.historyLabel, isCurrent && styles.historyLabelCurrent]}>
                  Week {index + 1}: {label}
                </Text>
              </View>
            )
          })}
        </Card.Content>
      </Card>

      <SectionLabel icon="clipboard-text-outline" label="DRIVER INSPECTION RECORD" />
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.recordRow}>
            <Text variant="bodyMedium">Completed Inspections</Text>
            <Text variant="titleMedium">{driverRecord.completed}</Text>
          </View>
          <View style={styles.recordRow}>
            <Text variant="bodyMedium">Completed On Time</Text>
            <Text variant="titleMedium">{driverRecord.onTimePercent != null ? `${driverRecord.onTimePercent}%` : '—'}</Text>
          </View>
          <View style={styles.recordRow}>
            <Text variant="bodyMedium">Average Inspection Quality</Text>
            <Text variant="titleMedium">{driverRecord.avgQuality != null ? `${driverRecord.avgQuality}%` : '—'}</Text>
          </View>
          <View style={styles.recordRow}>
            <Text variant="bodyMedium">Vehicle Care Rating</Text>
            <Text variant="titleMedium">{driverRecord.careRating}</Text>
          </View>
        </Card.Content>
      </Card>

      {report && (
        <Card style={styles.card}>
          <Card.Content>
            <SectionLabel icon="lightbulb-outline" label="AI RECOMMENDATION" />
            <Text variant="bodyMedium">{report.recommendation}</Text>
          </Card.Content>
        </Card>
      )}

      {canReview ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.decisionTitle}>
              What would you like to do?
            </Text>
            <TextInput
              mode="outlined"
              label="Comment (optional)"
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={2}
              style={styles.commentInput}
            />
            <Button
              mode="contained"
              onPress={() => handleDecision('approved')}
              loading={reviewInspection.isPending}
              disabled={reviewInspection.isPending}
              style={styles.decisionButton}
            >
              Approve Inspection
            </Button>
            <Button
              mode="contained-tonal"
              onPress={() => handleDecision('reinspection_requested')}
              loading={reviewInspection.isPending}
              disabled={reviewInspection.isPending}
              style={styles.decisionButton}
            >
              Request Re-inspection
            </Button>
            <Button
              mode="outlined"
              textColor={brandColors.alert}
              onPress={() => setShowFlagOptions((prev) => !prev)}
              disabled={reviewInspection.isPending}
              style={[styles.decisionButton, styles.flagButton]}
            >
              Flag Damage
            </Button>
            {showFlagOptions && (
              <View style={styles.flagOptionsRow}>
                <Chip
                  onPress={() => handleDecision('flagged', 'existing_damage')}
                  disabled={reviewInspection.isPending}
                  style={styles.flagChip}
                >
                  Existing Damage
                </Chip>
                <Chip
                  onPress={() => handleDecision('flagged', 'false_detection')}
                  disabled={reviewInspection.isPending}
                  style={styles.flagChip}
                >
                  False Detection
                </Chip>
              </View>
            )}
          </Card.Content>
        </Card>
      ) : (
        afterDecisionConfig && (
          <Card style={[styles.card, styles.afterCard]}>
            <Card.Content>
              <View style={styles.afterRow}>
                <IconBadge source={afterDecisionConfig.icon} size={16} backgroundColor={`${afterDecisionConfig.color}22`} color={afterDecisionConfig.color} />
                <Text variant="titleMedium" style={[styles.afterTitle, { color: afterDecisionConfig.color }]}>
                  {afterDecisionConfig.label}
                </Text>
              </View>
              {report && (
                <Text variant="bodyMedium" style={styles.afterDetail}>
                  Vehicle Health: {report.healthScore}/100
                </Text>
              )}
              <Text variant="bodySmall" style={styles.afterDetail}>
                Inspection added to vehicle history.
              </Text>
              {reviewStatus === 'approved' && (
                <Text variant="bodySmall" style={styles.afterDetail}>
                  Driver Vehicle Care: +2 TrustScore
                </Text>
              )}
              {inspection.owner_review_comment && (
                <View style={styles.reviewedComment}>
                  <Text variant="bodySmall" style={styles.reviewedCommentLabel}>
                    Your comment:
                  </Text>
                  <Text variant="bodyMedium">{inspection.owner_review_comment}</Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )
      )}

      <DamageOverlayModal
        visible={!!selectedFinding}
        onClose={() => setSelectedFinding(null)}
        photoPath={selectedFinding ? photoPathForShot(selectedFinding.shot) : null}
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
              }
            : null
        }
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
  vehicleName: {
    opacity: 0.6,
  },
  heading: {
    marginTop: 2,
  },
  date: {
    opacity: 0.6,
    marginTop: 2,
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  healthCard: {
    backgroundColor: brandColors.deep,
  },
  healthCardContent: {
    alignItems: 'center',
  },
  healthScore: {
    color: '#fff',
    marginTop: 8,
  },
  healthLabel: {
    color: brandColors.gold,
    marginTop: 2,
  },
  healthLabelWarn: {
    color: '#F0C674',
  },
  healthSubtext: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  summaryText: {
    flex: 1,
  },
  summaryTextWarn: {
    color: '#B5651D',
    fontWeight: '600',
  },
  damageCard: {
    borderColor: brandColors.alert,
    borderWidth: 1,
  },
  damageTitle: {
    color: brandColors.alert,
    marginBottom: 8,
  },
  damageDescription: {
    marginTop: 8,
    opacity: 0.7,
  },
  detail: {
    opacity: 0.7,
    marginBottom: 4,
  },
  verificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E3E3DD',
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verificationText: {
    fontWeight: '600',
  },
  verificationNote: {
    marginTop: 12,
    opacity: 0.6,
  },
  stars: {
    color: '#E0A800',
    marginBottom: 8,
  },
  qualityGrid: {
    marginBottom: 8,
  },
  qualityPercent: {
    color: brandColors.deep,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  historyLabel: {
    opacity: 0.8,
  },
  historyLabelCurrent: {
    fontWeight: '700',
    opacity: 1,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  decisionTitle: {
    marginBottom: 12,
  },
  commentInput: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  decisionButton: {
    marginBottom: 10,
  },
  flagButton: {
    borderColor: brandColors.alert,
  },
  flagOptionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  flagChip: {
    flex: 1,
  },
  afterCard: {
    borderWidth: 1,
    borderColor: '#E3E3DD',
  },
  afterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  afterTitle: {
    fontWeight: '700',
  },
  afterDetail: {
    opacity: 0.7,
    marginTop: 4,
  },
  reviewedComment: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E3E3DD',
  },
  reviewedCommentLabel: {
    opacity: 0.6,
    marginBottom: 2,
  },
})
