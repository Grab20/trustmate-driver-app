import { useEffect, useState } from 'react'
import { View, StyleSheet, Pressable } from 'react-native'
import { Text, Card, Avatar, Icon } from 'react-native-paper'
import type { OwnerFleetEntry } from '../hooks/useOwnerFleet'
import { useDriverDistanceTotals } from '../hooks/useDriverDistanceTotals'
import { useDriverInspectionsForOwner } from '../hooks/useInspections'
import { useDriverTrafficOffencesForOwner } from '../hooks/useTrafficOffences'
import { LiveStatusMap } from './LiveStatusMap'
import { reverseGeocodeLabel } from '../lib/reverseGeocode'
import { formatElapsedSince, formatShortDate } from '../utils/schedule'
import { brandColors } from '../theme/theme'

type InfoKey = 'location' | 'km' | 'inspection' | 'fines'

const CHIPS: { key: InfoKey; label: string; icon: string }[] = [
  { key: 'location', label: 'Location', icon: 'map-marker' },
  { key: 'km', label: 'Weekly KM', icon: 'speedometer' },
  { key: 'inspection', label: 'Inspection', icon: 'clipboard-check-outline' },
  { key: 'fines', label: 'Fines', icon: 'alert-octagon-outline' },
]

export function FleetDriverCard({ entry, onPress }: { entry: OwnerFleetEntry; onPress: () => void }) {
  const isMoving = entry.liveStatus?.is_moving ?? false
  const [selected, setSelected] = useState<InfoKey | null>(null)
  const [addressLabel, setAddressLabel] = useState<string | null>(null)

  const distanceTotals = useDriverDistanceTotals(entry.driver_id ?? undefined)
  const inspections = useDriverInspectionsForOwner(entry.driver_id ?? undefined)
  const offences = useDriverTrafficOffencesForOwner(entry.driver_id ?? undefined)

  const initials = (entry.driver?.full_name ?? '?')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  useEffect(() => {
    if (selected !== 'location' || !entry.liveStatus) return
    let cancelled = false
    reverseGeocodeLabel(Number(entry.liveStatus.lat), Number(entry.liveStatus.lng)).then((label) => {
      if (!cancelled) setAddressLabel(label)
    })
    return () => {
      cancelled = true
    }
  }, [selected, entry.liveStatus?.lat, entry.liveStatus?.lng])

  const lastInspection = inspections.data?.find((i) => i.inspection_type === 'weekly_checkin') ?? null
  const unpaidFines = offences.data?.filter((o) => o.status === 'unpaid').length ?? 0

  return (
    <Card style={styles.card}>
      <Pressable onPress={onPress}>
        <Card.Content style={styles.content}>
          <View style={[styles.avatarRing, isMoving && styles.avatarRingMoving]}>
            {entry.driver?.photo_url ? (
              <Avatar.Image size={52} source={{ uri: entry.driver.photo_url }} />
            ) : (
              <Avatar.Text size={52} label={initials} />
            )}
            <View style={[styles.statusDot, isMoving ? styles.statusDotMoving : styles.statusDotParked]} />
          </View>
          <View style={styles.info}>
            <Text variant="titleMedium">{entry.driver?.full_name ?? 'Driver'}</Text>
            <View style={styles.vehicleRow}>
              <Icon source="car" size={14} color="#8A8A8A" />
              <Text variant="bodySmall" style={styles.vehicle}>
                {entry.cars ? `${entry.cars.make} ${entry.cars.model}` : 'Vehicle unavailable'}
              </Text>
            </View>
            {entry.liveStatus ? (
              <View style={styles.statusRow}>
                <Icon source={isMoving ? 'navigation' : 'map-marker'} size={14} color={isMoving ? brandColors.green : '#8A8A8A'} />
                <Text variant="bodySmall" style={[styles.since, isMoving && styles.sinceMoving]}>
                  {isMoving
                    ? `Driving${entry.liveStatus.speed_kmh != null ? ` · ${Math.round(entry.liveStatus.speed_kmh)} km/h` : ''}`
                    : `Parked · here for ${formatElapsedSince(entry.liveStatus.state_since)}`}
                </Text>
              </View>
            ) : (
              <Text variant="bodySmall" style={styles.since}>
                No location yet
              </Text>
            )}
          </View>
          <Icon source="chevron-right" size={22} color="#B8B8AE" />
        </Card.Content>
      </Pressable>

      <View style={styles.chipRow}>
        {CHIPS.map((chip) => {
          const isSelected = selected === chip.key
          return (
            <Pressable
              key={chip.key}
              onPress={() => setSelected(isSelected ? null : chip.key)}
              style={[styles.chip, isSelected && styles.chipSelected]}
            >
              <Icon source={chip.icon} size={14} color={isSelected ? '#fff' : brandColors.darkGreen} />
              <Text variant="labelSmall" style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>
                {chip.label}
              </Text>
            </Pressable>
          )
        })}
      </View>

      {selected && (
        <View style={styles.expandedPanel}>
          {selected === 'location' &&
            (entry.liveStatus ? (
              <LiveStatusMap liveStatus={entry.liveStatus} addressLabel={addressLabel} height={180} />
            ) : (
              <Text variant="bodyMedium" style={styles.expandedEmpty}>
                No location data yet.
              </Text>
            ))}
          {selected === 'km' && (
            <View style={styles.expandedRow}>
              <Text variant="headlineSmall" style={styles.expandedValue}>
                {(distanceTotals.data?.week ?? 0).toFixed(0)} km
              </Text>
              <Text variant="bodySmall" style={styles.expandedLabel}>
                driven this week
              </Text>
            </View>
          )}
          {selected === 'inspection' && (
            <View style={styles.expandedRow}>
              <Text variant="titleMedium" style={styles.expandedValue}>
                {lastInspection?.created_at ? formatShortDate(new Date(lastInspection.created_at)) : 'None yet'}
              </Text>
              <Text variant="bodySmall" style={styles.expandedLabel}>
                last inspection
              </Text>
            </View>
          )}
          {selected === 'fines' && (
            <View style={styles.expandedRow}>
              <Text variant="titleMedium" style={[styles.expandedValue, unpaidFines > 0 && styles.expandedValueAlert]}>
                {unpaidFines === 0 ? 'No unpaid fines' : `${unpaidFines} unpaid fine${unpaidFines === 1 ? '' : 's'}`}
              </Text>
            </View>
          )}
        </View>
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarRing: {
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#EAEAE5',
    padding: 2,
  },
  avatarRingMoving: {
    borderColor: brandColors.green,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  statusDotMoving: {
    backgroundColor: brandColors.green,
  },
  statusDotParked: {
    backgroundColor: '#B8B8AE',
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 4,
  },
  vehicle: {
    opacity: 0.7,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  since: {
    opacity: 0.6,
  },
  sinceMoving: {
    color: brandColors.green,
    opacity: 1,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F4F7F5',
  },
  chipSelected: {
    backgroundColor: brandColors.darkGreen,
  },
  chipLabel: {
    color: brandColors.darkGreen,
    fontWeight: '600',
  },
  chipLabelSelected: {
    color: '#fff',
  },
  expandedPanel: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  expandedRow: {
    backgroundColor: '#F4F7F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  expandedValue: {
    color: brandColors.darkGreen,
    fontWeight: '700',
  },
  expandedValueAlert: {
    color: '#B5651D',
  },
  expandedLabel: {
    opacity: 0.6,
    marginTop: 2,
  },
  expandedEmpty: {
    opacity: 0.6,
    textAlign: 'center',
    paddingVertical: 12,
  },
})
