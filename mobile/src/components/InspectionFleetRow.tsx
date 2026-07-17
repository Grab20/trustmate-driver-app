import { View, StyleSheet, Pressable } from 'react-native'
import { Text } from 'react-native-paper'
import type { OwnerFleetEntry } from '../hooks/useOwnerFleet'
import { useDriverProfileForOwner } from '../hooks/useDriverProfileForOwner'
import { useDriverInspectionsForOwner } from '../hooks/useInspections'
import { useDriverTrafficOffencesForOwner } from '../hooks/useTrafficOffences'
import { InspectionPhotoThumbnail } from './InspectionPhotoThumbnail'
import { isVehicleHealthReport } from '../types/inspectionReport'
import { brandColors, radius, cardShadow } from '../theme/theme'

export function InspectionFleetRow({
  entry,
  onPress,
}: {
  entry: OwnerFleetEntry
  onPress: () => void
}) {
  const { data: driverProfile } = useDriverProfileForOwner(entry.driver_id ?? undefined)
  const { data: inspections } = useDriverInspectionsForOwner(entry.driver_id ?? undefined)
  const { data: offences } = useDriverTrafficOffencesForOwner(entry.driver_id ?? undefined)

  const lastInspection = inspections?.find((i) => i.inspection_type === 'weekly_checkin') ?? null
  const report = lastInspection && isVehicleHealthReport(lastInspection.ai_analysis) ? lastInspection.ai_analysis : null

  const missedPayments = driverProfile?.missed_payments ?? 0
  const hasIncidents = (driverProfile?.accidents ?? 0) > 0 || (driverProfile?.damage_incidents ?? 0) > 0
  const unpaidOffences = offences?.filter((o) => o.status === 'unpaid').length ?? 0
  const isGoodStanding = missedPayments === 0 && lastInspection != null && !hasIncidents && unpaidOffences === 0

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.name}>{entry.driver?.full_name ?? 'Driver'}</Text>
        <View style={[styles.pill, isGoodStanding ? styles.pillGood : styles.pillAttention]}>
          <Text style={styles.pillText}>{isGoodStanding ? 'Good Standing' : 'Needs Attention'}</Text>
        </View>
      </View>
      <Text style={styles.vehicle}>{entry.cars ? `${entry.cars.make} ${entry.cars.model}` : 'Vehicle unavailable'}</Text>

      {lastInspection ? (
        <>
          <View style={styles.reportRow}>
            <Text style={styles.reportDate}>
              {new Date(lastInspection.created_at ?? '').toLocaleDateString(undefined, {
                day: 'numeric',
                month: 'short',
              })}
            </Text>
            {report && <Text style={styles.reportScore}>{report.healthScore}/100</Text>}
          </View>
          {lastInspection.photo_urls && lastInspection.photo_urls.length > 0 && (
            <View style={styles.thumbRow}>
              {lastInspection.photo_urls.slice(0, 4).map((path) => (
                <InspectionPhotoThumbnail key={path} path={path} />
              ))}
            </View>
          )}
        </>
      ) : (
        <Text style={styles.noInspection}>No inspection submitted yet.</Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: brandColors.cardGreen,
    borderRadius: radius.lg,
    padding: 20,
    marginBottom: 16,
    ...cardShadow,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    color: brandColors.inkOnCard,
    fontSize: 17,
    fontWeight: '700',
  },
  pill: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillGood: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  pillAttention: {
    backgroundColor: brandColors.alert,
  },
  pillText: {
    color: brandColors.inkOnCard,
    fontWeight: '700',
    fontSize: 11,
  },
  vehicle: {
    color: brandColors.inkOnCardSoft,
    marginTop: 2,
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  reportDate: {
    color: brandColors.inkOnCard,
    fontWeight: '600',
  },
  reportScore: {
    color: brandColors.gold,
    fontWeight: '700',
  },
  thumbRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  noInspection: {
    color: brandColors.inkOnCardSoft,
    marginTop: 16,
  },
})
