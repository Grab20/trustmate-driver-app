import { View, StyleSheet, Pressable } from 'react-native'
import { Text, Card, Icon } from 'react-native-paper'
import type { OwnerFleetEntry } from '../hooks/useOwnerFleet'
import { useDriverProfileForOwner } from '../hooks/useDriverProfileForOwner'
import { useDriverInspectionsForOwner } from '../hooks/useInspections'
import { useDriverTrafficOffencesForOwner } from '../hooks/useTrafficOffences'
import { IconBadge } from './IconBadge'
import { brandColors } from '../theme/theme'

export function RentalHealthFleetRow({ entry, onPress }: { entry: OwnerFleetEntry; onPress: () => void }) {
  const { data: driverProfile } = useDriverProfileForOwner(entry.driver_id ?? undefined)
  const { data: inspections } = useDriverInspectionsForOwner(entry.driver_id ?? undefined)
  const { data: offences } = useDriverTrafficOffencesForOwner(entry.driver_id ?? undefined)

  const missedPayments = driverProfile?.missed_payments ?? 0
  const hasIncidents = (driverProfile?.accidents ?? 0) > 0 || (driverProfile?.damage_incidents ?? 0) > 0
  const hasInspection = (inspections?.some((i) => i.inspection_type === 'weekly_checkin') ?? false)
  const unpaidOffences = offences?.filter((o) => o.status === 'unpaid').length ?? 0
  const isGoodStanding = missedPayments === 0 && hasInspection && !hasIncidents && unpaidOffences === 0

  return (
    <Pressable onPress={onPress}>
      <Card style={[styles.card, isGoodStanding && styles.goodStandingCard]}>
        <Card.Content style={styles.content}>
          <View style={styles.headerRow}>
            <Text variant="titleMedium">{entry.driver?.full_name ?? 'Driver'}</Text>
            <View style={[styles.statusChip, isGoodStanding ? styles.goodChip : styles.attentionChip]}>
              <Text variant="labelSmall" style={isGoodStanding ? styles.goodChipText : styles.attentionChipText}>
                {isGoodStanding ? 'Good Standing' : 'Needs Attention'}
              </Text>
            </View>
          </View>
          <Text variant="bodySmall" style={styles.vehicle}>
            {entry.cars ? `${entry.cars.make} ${entry.cars.model}` : 'Vehicle unavailable'}
          </Text>
          <View style={styles.signalsRow}>
            <View style={styles.signal}>
              <IconBadge
                source={missedPayments === 0 ? 'cash-check' : 'cash-remove'}
                size={14}
                backgroundColor={missedPayments === 0 ? brandColors.green : '#B5651D'}
              />
              <Text variant="bodySmall" style={styles.signalLabel}>
                Payment
              </Text>
            </View>
            <View style={styles.signal}>
              <IconBadge
                source={hasInspection ? 'clipboard-check' : 'clipboard-alert-outline'}
                size={14}
                backgroundColor={hasInspection ? brandColors.green : '#B5651D'}
              />
              <Text variant="bodySmall" style={styles.signalLabel}>
                Inspection
              </Text>
            </View>
            <View style={styles.signal}>
              <IconBadge
                source={unpaidOffences === 0 ? 'shield-check' : 'alert-octagon'}
                size={14}
                backgroundColor={unpaidOffences === 0 ? brandColors.green : brandColors.errorRed}
              />
              <Text variant="bodySmall" style={styles.signalLabel}>
                {unpaidOffences === 0 ? 'No fines' : `${unpaidOffences} fine${unpaidOffences === 1 ? '' : 's'}`}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  goodStandingCard: {
    borderColor: brandColors.green,
    borderWidth: 1,
  },
  content: {
    paddingVertical: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicle: {
    opacity: 0.6,
    marginTop: 2,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  goodChip: {
    backgroundColor: '#DFF5E6',
  },
  attentionChip: {
    backgroundColor: '#FBE8C8',
  },
  goodChipText: {
    color: '#1E7A3D',
    fontWeight: '700',
  },
  attentionChipText: {
    color: '#7A4A00',
    fontWeight: '700',
  },
  signalsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 20,
  },
  signal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  signalLabel: {
    opacity: 0.7,
  },
})
