import { useEffect, useState } from 'react'
import { View, StyleSheet, Pressable } from 'react-native'
import { Text, Avatar, Icon } from 'react-native-paper'
import type { OwnerFleetEntry } from '../hooks/useOwnerFleet'
import { useDriverDistanceTotals } from '../hooks/useDriverDistanceTotals'
import { useDriverInspectionsForOwner } from '../hooks/useInspections'
import { useDriverTrafficOffencesForOwner } from '../hooks/useTrafficOffences'
import { LiveStatusMap } from './LiveStatusMap'
import { reverseGeocodeLabel } from '../lib/reverseGeocode'
import { formatElapsedSince, formatShortDate } from '../utils/schedule'
import { brandColors, radius, cardShadow } from '../theme/theme'

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
    <View style={styles.card}>
      <Pressable onPress={onPress}>
        <View style={styles.content}>
          <View style={[styles.avatarRing, isMoving && styles.avatarRingMoving]}>
            {entry.driver?.photo_url ? (
              <Avatar.Image size={52} source={{ uri: entry.driver.photo_url }} />
            ) : (
              <Avatar.Text size={52} label={initials} />
            )}
            <View style={[styles.statusDot, isMoving ? styles.statusDotMoving : styles.statusDotParked]} />
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{entry.driver?.full_name ?? 'Driver'}</Text>
            <View style={styles.vehicleRow}>
              <Icon source="car" size={14} color={brandColors.inkOnCardSoft} />
              <Text style={styles.vehicle}>
                {entry.cars ? `${entry.cars.make} ${entry.cars.model}` : 'Vehicle unavailable'}
              </Text>
            </View>
            {entry.liveStatus ? (
              <View style={styles.statusRow}>
                <Icon source={isMoving ? 'navigation' : 'map-marker'} size={14} color={isMoving ? brandColors.gold : brandColors.inkOnCardSoft} />
                <Text style={[styles.since, isMoving && styles.sinceMoving]}>
                  {isMoving
                    ? `Driving${entry.liveStatus.speed_kmh != null ? ` · ${Math.round(entry.liveStatus.speed_kmh)} km/h` : ''}`
                    : `Parked · here for ${formatElapsedSince(entry.liveStatus.state_since)}`}
                </Text>
              </View>
            ) : (
              <Text style={styles.since}>No location yet</Text>
            )}
          </View>
          <Icon source="chevron-right" size={22} color={brandColors.inkOnCardSoft} />
        </View>
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
              <Icon source={chip.icon} size={14} color={isSelected ? brandColors.deep : brandColors.inkOnCard} />
              <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>{chip.label}</Text>
            </Pressable>
          )
        })}
      </View>

      {selected && (
        <View style={styles.expandedPanel}>
          {selected === 'location' &&
            (entry.liveStatus ? (
              <LiveStatusMap
                liveStatus={entry.liveStatus}
                addressLabel={addressLabel}
                height={220}
                photoUrl={entry.driver?.photo_url}
                initials={entry.driver?.full_name ?? undefined}
              />
            ) : (
              <Text style={styles.expandedEmpty}>No location data yet.</Text>
            ))}
          {selected === 'km' && (
            <View style={styles.expandedRow}>
              <Text style={styles.expandedValue}>{(distanceTotals.data?.week ?? 0).toFixed(0)} km</Text>
              <Text style={styles.expandedLabel}>driven this week</Text>
            </View>
          )}
          {selected === 'inspection' && (
            <View style={styles.expandedRow}>
              <Text style={styles.expandedValue}>
                {lastInspection?.created_at ? formatShortDate(new Date(lastInspection.created_at)) : 'None yet'}
              </Text>
              <Text style={styles.expandedLabel}>last inspection</Text>
            </View>
          )}
          {selected === 'fines' && (
            <View style={styles.expandedRow}>
              <Text style={[styles.expandedValue, unpaidFines > 0 && styles.expandedValueAlert]}>
                {unpaidFines === 0 ? 'No unpaid fines' : `${unpaidFines} unpaid fine${unpaidFines === 1 ? '' : 's'}`}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: brandColors.cardGreen,
    borderRadius: radius.lg,
    marginBottom: 16,
    padding: 20,
    ...cardShadow,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarRing: {
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    padding: 2,
  },
  avatarRingMoving: {
    borderColor: brandColors.gold,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: brandColors.cardGreen,
  },
  statusDotMoving: {
    backgroundColor: brandColors.gold,
  },
  statusDotParked: {
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    color: brandColors.inkOnCard,
    fontSize: 17,
    fontWeight: '700',
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 4,
  },
  vehicle: {
    color: brandColors.inkOnCardSoft,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  since: {
    color: brandColors.inkOnCardSoft,
  },
  sinceMoving: {
    color: brandColors.gold,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  chipSelected: {
    backgroundColor: brandColors.gold,
  },
  chipLabel: {
    color: brandColors.inkOnCard,
    fontWeight: '600',
    fontSize: 12,
  },
  chipLabelSelected: {
    color: brandColors.deep,
  },
  expandedPanel: {
    marginTop: 4,
  },
  expandedRow: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  expandedValue: {
    color: brandColors.inkOnCard,
    fontWeight: '700',
    fontSize: 16,
  },
  expandedValueAlert: {
    color: brandColors.gold,
  },
  expandedLabel: {
    color: brandColors.inkOnCardSoft,
    marginTop: 2,
  },
  expandedEmpty: {
    color: brandColors.inkOnCardSoft,
    textAlign: 'center',
    paddingVertical: 12,
  },
})
