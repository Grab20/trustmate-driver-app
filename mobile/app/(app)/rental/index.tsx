import { useEffect, useState } from 'react'
import { View, StyleSheet, ScrollView, Linking } from 'react-native'
import { Text, Card, Button, Icon } from 'react-native-paper'
import { useRouter } from 'expo-router'
import MapView, { Marker } from 'react-native-maps'
import { useActiveRental } from '../../../src/hooks/useActiveRental'
import { useDriverProfile } from '../../../src/hooks/useDriverProfile'
import { useInspectionHistory } from '../../../src/hooks/useInspections'
import { useMyTrafficOffences } from '../../../src/hooks/useTrafficOffences'
import { useMyLiveStatus } from '../../../src/hooks/useMyLiveStatus'
import { LoadingScreen } from '../../../src/components/LoadingScreen'
import { RentalTimeline, type TimelineEvent } from '../../../src/components/RentalTimeline'
import { IconBadge } from '../../../src/components/IconBadge'
import { reverseGeocodeLabel } from '../../../src/lib/reverseGeocode'
import { formatElapsedSince, getNextOccurrence, formatShortDate } from '../../../src/utils/schedule'
import { brandColors } from '../../../src/theme/theme'

function ChecklistRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <View style={styles.checklistRow}>
      <Icon source={ok ? 'check-circle' : 'alert-circle'} size={18} color={ok ? brandColors.green : '#B5651D'} />
      <Text variant="bodyMedium" style={styles.checklistLabel}>
        {label}
      </Text>
    </View>
  )
}

function SectionLabel({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.sectionLabelRow}>
      <IconBadge source={icon} size={14} backgroundColor={brandColors.darkGreen} />
      <Text variant="labelMedium" style={styles.sectionLabel}>
        {label}
      </Text>
    </View>
  )
}

export default function RentalScreen() {
  const router = useRouter()
  const { data: activeRental, isLoading: isRentalLoading } = useActiveRental()
  const { data: driverProfile, isLoading: isProfileLoading } = useDriverProfile()
  const { data: inspections, isLoading: isInspectionsLoading } = useInspectionHistory()
  const { data: trafficOffences } = useMyTrafficOffences()
  const { data: liveStatus } = useMyLiveStatus()
  const [addressLabel, setAddressLabel] = useState<string | null>(null)

  useEffect(() => {
    if (!liveStatus) {
      setAddressLabel(null)
      return
    }
    let cancelled = false
    reverseGeocodeLabel(Number(liveStatus.lat), Number(liveStatus.lng)).then((label) => {
      if (!cancelled) setAddressLabel(label)
    })
    return () => {
      cancelled = true
    }
  }, [liveStatus?.lat, liveStatus?.lng])

  if (isRentalLoading || isProfileLoading || isInspectionsLoading) return <LoadingScreen />
  if (!activeRental) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="bodyMedium">No active rental yet.</Text>
      </View>
    )
  }

  const car = activeRental.cars
  const lastInspection = inspections?.find((i) => i.inspection_type === 'weekly_checkin') ?? null
  const lastPayment = inspections?.find((i) => i.inspection_type === 'proof_of_payment') ?? null
  const nextInspection = getNextOccurrence(car?.weekly_checkin_day ?? null, car?.checkin_time ?? null)
  const nextPayment = getNextOccurrence(car?.weekly_checkin_day ?? null, car?.checkin_time ?? null)
  const isMoving = liveStatus?.is_moving ?? false

  const missedPayments = driverProfile?.missed_payments ?? 0
  const hasIncidents = (driverProfile?.accidents ?? 0) > 0 || (driverProfile?.damage_incidents ?? 0) > 0
  const paymentsUpToDate = missedPayments === 0
  const inspectionCompleted = lastInspection != null
  const isGoodStanding = paymentsUpToDate && inspectionCompleted && !hasIncidents

  const timelineEvents: TimelineEvent[] = []
  if (activeRental.matched_at) {
    timelineEvents.push({ id: 'started', title: 'Rental started', date: activeRental.matched_at, icon: 'flag-checkered' })
  }
  if (lastInspection?.created_at) {
    timelineEvents.push({
      id: 'inspection',
      title: 'Inspection completed',
      date: lastInspection.created_at,
      icon: 'clipboard-check',
    })
  }
  if (lastPayment?.created_at) {
    timelineEvents.push({ id: 'payment', title: 'Payment confirmed', date: lastPayment.created_at, icon: 'cash-check' })
  }
  timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  function handleMessageOwner() {
    const whatsapp = activeRental?.owner?.whatsapp
    const phone = activeRental?.owner?.phone
    if (whatsapp) {
      Linking.openURL(`https://wa.me/${whatsapp.replace(/\D/g, '')}`).catch(() => {})
    } else if (phone) {
      Linking.openURL(`tel:${phone}`).catch(() => {})
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.heading}>
        {car ? `${car.make} ${car.model}` : 'Vehicle'}
      </Text>

      {liveStatus && (
        <View style={styles.mapCard}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: Number(liveStatus.lat),
              longitude: Number(liveStatus.lng),
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            region={{
              latitude: Number(liveStatus.lat),
              longitude: Number(liveStatus.lng),
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{ latitude: Number(liveStatus.lat), longitude: Number(liveStatus.lng) }}
              title={isMoving ? 'Driving' : 'Parked'}
            />
          </MapView>
          <View style={styles.mapOverlay}>
            <IconBadge source={isMoving ? 'navigation' : 'map-marker'} backgroundColor={brandColors.darkGreen} />
            <View style={styles.mapOverlayText}>
              <Text variant="bodyMedium" style={styles.mapOverlayLocation} numberOfLines={1}>
                {addressLabel ?? 'Locating…'}
              </Text>
              <Text variant="bodySmall" style={styles.mapOverlaySince}>
                {isMoving ? `${Math.round(liveStatus.speed_kmh ?? 0)} km/h` : `Parked ${formatElapsedSince(liveStatus.state_since)} ago`}
              </Text>
            </View>
          </View>
        </View>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <SectionLabel icon="account" label="VEHICLE OWNER" />
          <View style={styles.ownerRow}>
            <Text variant="titleMedium">{activeRental.owner?.full_name ?? 'Vehicle Owner'}</Text>
            <Button
              mode="outlined"
              compact
              onPress={handleMessageOwner}
              disabled={!activeRental.owner?.whatsapp && !activeRental.owner?.phone}
            >
              Message
            </Button>
          </View>
          {activeRental.matched_at && (
            <Text variant="bodySmall" style={styles.ownerDetail}>
              Started {formatShortDate(new Date(activeRental.matched_at))}
            </Text>
          )}
          {car?.price_per_week != null && (
            <Text variant="bodySmall" style={styles.ownerDetail}>
              Rate R{car.price_per_week}/week
            </Text>
          )}
        </Card.Content>
      </Card>

      <Card style={[styles.card, isGoodStanding && styles.goodStandingCard]}>
        <Card.Content>
          <SectionLabel icon="shield-check" label="RENTAL HEALTH" />
          <Text variant="titleMedium" style={styles.healthTitle}>
            {isGoodStanding ? 'Good Standing' : 'Needs Attention'}
          </Text>
          <View style={styles.checklist}>
            <ChecklistRow ok={paymentsUpToDate} label="Payment up to date" />
            <ChecklistRow ok={inspectionCompleted} label="Inspection completed" />
            <ChecklistRow ok={!hasIncidents} label="No active incidents" />
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.rowBetween}>
            <SectionLabel icon="cash-multiple" label="PAYMENTS" />
            {!paymentsUpToDate && <Text style={styles.dueBadge}>Due</Text>}
          </View>
          <Text variant="titleLarge" style={styles.paymentAmount}>
            R{car?.price_per_week ?? 0}/week
          </Text>
          {nextPayment && (
            <Text variant="bodySmall" style={styles.ownerDetail}>
              Next payment {formatShortDate(nextPayment)}
            </Text>
          )}
          {(driverProfile?.consecutive_payments ?? 0) > 0 && (
            <Text variant="bodyMedium" style={styles.streak}>
              🔥 {driverProfile?.consecutive_payments}-week streak
            </Text>
          )}
          <Button mode="contained" onPress={() => router.push('/rental/inspections/payment')} style={styles.actionButton}>
            Pay Now
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <SectionLabel icon="car-wrench" label="VEHICLE CONDITION" />
          <Text variant="bodyMedium" style={styles.ownerDetail}>
            Last inspection: {lastInspection?.created_at ? formatShortDate(new Date(lastInspection.created_at)) : 'None yet'}
          </Text>
          {nextInspection && (
            <Text variant="bodyMedium" style={styles.ownerDetail}>
              Next inspection: {formatShortDate(nextInspection)}
            </Text>
          )}
          <Button mode="contained" onPress={() => router.push('/rental/inspections/new')} style={styles.actionButton}>
            Complete Inspection
          </Button>
        </Card.Content>
      </Card>

      {timelineEvents.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <SectionLabel icon="timeline-clock" label="RENTAL TIMELINE" />
            <View style={styles.timelineSpacing}>
              <RentalTimeline events={timelineEvents} />
            </View>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <SectionLabel icon="alert-octagon-outline" label="TRAFFIC OFFENCES" />
          <Text variant="bodyMedium" style={styles.ownerDetail}>
            {(trafficOffences?.length ?? 0) === 0
              ? 'No traffic offences on record.'
              : `${trafficOffences?.length} on record`}
          </Text>
          <Button mode="outlined" onPress={() => router.push('/rental/traffic-offences')} style={styles.actionButton}>
            View Traffic Offences
          </Button>
        </Card.Content>
      </Card>

      <Button
        mode="outlined"
        onPress={() => router.push('/rental/report-incident')}
        style={styles.reportButton}
        textColor={brandColors.errorRed}
      >
        Report Incident
      </Button>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  heading: {
    marginBottom: 16,
  },
  mapCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    width: '100%',
    height: 180,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  mapOverlayText: {
    marginLeft: 10,
    flex: 1,
  },
  mapOverlayLocation: {
    fontWeight: '600',
  },
  mapOverlaySince: {
    opacity: 0.6,
    marginTop: 2,
  },
  card: {
    marginBottom: 16,
  },
  goodStandingCard: {
    borderColor: brandColors.green,
    borderWidth: 1,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionLabel: {
    opacity: 0.6,
    letterSpacing: 0.5,
  },
  ownerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ownerDetail: {
    opacity: 0.6,
    marginTop: 4,
  },
  healthTitle: {
    color: brandColors.darkGreen,
    marginBottom: 12,
  },
  checklist: {
    gap: 8,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checklistLabel: {
    marginLeft: 4,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dueBadge: {
    backgroundColor: '#FBE8C8',
    color: '#7A4A00',
    fontWeight: '700',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  paymentAmount: {
    marginTop: 4,
    color: brandColors.darkGreen,
  },
  streak: {
    marginTop: 8,
  },
  actionButton: {
    marginTop: 16,
  },
  timelineSpacing: {
    marginTop: 4,
  },
  reportButton: {
    marginTop: 8,
    marginBottom: 24,
    borderColor: brandColors.errorRed,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
