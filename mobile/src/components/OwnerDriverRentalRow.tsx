import { View, StyleSheet, Pressable } from 'react-native'
import { Text } from 'react-native-paper'
import type { OwnerFleetEntry } from '../hooks/useOwnerFleet'
import { useDriverProfileForOwner } from '../hooks/useDriverProfileForOwner'
import { TrustScoreRing } from './TrustScoreRing'
import { getRentalWeekNumber } from '../utils/schedule'
import { brandColors, radius, cardShadow } from '../theme/theme'

const RENTAL_TERM_WEEKS = 52

export function OwnerDriverRentalRow({ entry, onPress }: { entry: OwnerFleetEntry; onPress: () => void }) {
  const { data: driverProfile } = useDriverProfileForOwner(entry.driver_id ?? undefined)

  const weekNumber = getRentalWeekNumber(entry.matched_at)
  const weekPercent = weekNumber != null ? Math.min(100, Math.round((weekNumber / RENTAL_TERM_WEEKS) * 100)) : 0

  const ontime = driverProfile?.ontime_payments ?? 0
  const missed = driverProfile?.missed_payments ?? 0
  const late = driverProfile?.late_payments ?? 0
  const paymentTotal = ontime + missed + late
  const paymentReliability = paymentTotal > 0 ? Math.round((ontime / paymentTotal) * 100) : null

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.info}>
          <Text style={styles.name}>{entry.driver?.full_name ?? 'Driver'}</Text>
          <Text style={styles.vehicle}>
            {entry.cars ? `${entry.cars.make} ${entry.cars.model}` : 'Vehicle unavailable'}
          </Text>
        </View>
        <TrustScoreRing score={driverProfile?.trust_score ?? 0} size={56} strokeWidth={5} />
      </View>

      {weekNumber != null && (
        <View style={styles.progressBlock}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>
              Week {weekNumber} of {RENTAL_TERM_WEEKS}
            </Text>
            <Text style={styles.progressPercent}>{weekPercent}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${weekPercent}%` }]} />
          </View>
        </View>
      )}

      {paymentReliability != null && (
        <Text style={styles.reliability}>{paymentReliability}% payments on time</Text>
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    color: brandColors.inkOnCard,
    fontSize: 17,
    fontWeight: '700',
  },
  vehicle: {
    color: brandColors.inkOnCardSoft,
    marginTop: 2,
  },
  progressBlock: {
    marginTop: 16,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    color: brandColors.inkOnCard,
    fontWeight: '600',
  },
  progressPercent: {
    color: brandColors.gold,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: brandColors.gold,
  },
  reliability: {
    color: brandColors.inkOnCardSoft,
    marginTop: 12,
  },
})
