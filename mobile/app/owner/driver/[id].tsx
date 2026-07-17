import { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ScrollView, View, StyleSheet, Alert } from 'react-native'
import { Text, Card, TextInput, Button, Avatar } from 'react-native-paper'
import { useDriverLiveStatus } from '../../../src/hooks/useDriverLiveStatus'
import { useDriverTripHistory } from '../../../src/hooks/useDriverTripHistory'
import { useDriverInspectionsForOwner } from '../../../src/hooks/useInspections'
import { useDriverLifetimeStats } from '../../../src/hooks/useDriverLifetimeStats'
import { useDriverDistanceTotals } from '../../../src/hooks/useDriverDistanceTotals'
import { useDriverProfileForOwner } from '../../../src/hooks/useDriverProfileForOwner'
import { useDriverTrafficOffencesForOwner } from '../../../src/hooks/useTrafficOffences'
import { useCar, useUpdateNextServiceDate } from '../../../src/hooks/useCar'
import { useProfile } from '../../../src/hooks/useProfile'
import { LoadingScreen } from '../../../src/components/LoadingScreen'
import { InspectionReviewCard } from '../../../src/components/InspectionReviewCard'
import { StatTile } from '../../../src/components/StatTile'
import { TrafficOffenceRow } from '../../../src/components/TrafficOffenceRow'
import { TripRouteRow } from '../../../src/components/TripRouteRow'
import { LiveStatusMap } from '../../../src/components/LiveStatusMap'
import { SectionLabel } from '../../../src/components/SectionLabel'
import { ChecklistRow } from '../../../src/components/ChecklistRow'
import { TrustScoreRing } from '../../../src/components/TrustScoreRing'
import { ReliabilityBar } from '../../../src/components/ReliabilityBar'
import { formatShortDate, getNextOccurrence } from '../../../src/utils/schedule'
import { reverseGeocodeLabel } from '../../../src/lib/reverseGeocode'
import { brandColors } from '../../../src/theme/theme'

function formatDrivingTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.round((seconds % 3600) / 60)
  if (hours === 0) return `${minutes}m`
  return `${hours}h${minutes.toString().padStart(2, '0')}m`
}

function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

export default function OwnerDriverDetailScreen() {
  const router = useRouter()
  const { id, carId } = useLocalSearchParams<{ id: string; carId: string }>()
  const { data: liveStatus, isLoading: isLiveStatusLoading } = useDriverLiveStatus(id)
  const { data: trips } = useDriverTripHistory(id)
  const { data: inspections } = useDriverInspectionsForOwner(id)
  const { data: lifetimeStats } = useDriverLifetimeStats(id)
  const { data: distanceTotals } = useDriverDistanceTotals(id)
  const { data: driverProfile } = useDriverProfileForOwner(id)
  const { data: offences } = useDriverTrafficOffencesForOwner(id)
  const { data: profile } = useProfile(id)
  const { data: car } = useCar(carId || undefined)
  const updateNextServiceDate = useUpdateNextServiceDate(carId || undefined)
  const [nextServiceInput, setNextServiceInput] = useState('')
  const [addressLabel, setAddressLabel] = useState<string | null>(null)

  useEffect(() => {
    setNextServiceInput(car?.next_service_date ?? '')
  }, [car?.next_service_date])

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

  if (isLiveStatusLoading) return <LoadingScreen />

  const lastInspection = inspections?.find((i) => i.inspection_type === 'weekly_checkin') ?? null
  const nextInspection = getNextOccurrence(car?.weekly_checkin_day ?? null, car?.checkin_time ?? null)
  const nextPayment = getNextOccurrence(car?.weekly_checkin_day ?? null, car?.checkin_time ?? null)

  const missedPayments = driverProfile?.missed_payments ?? 0
  const hasIncidents = (driverProfile?.accidents ?? 0) > 0 || (driverProfile?.damage_incidents ?? 0) > 0
  const paymentsUpToDate = missedPayments === 0
  const inspectionCompleted = lastInspection != null

  const ontime = driverProfile?.ontime_payments ?? 0
  const late = driverProfile?.late_payments ?? 0
  const paymentTotal = ontime + missedPayments + late
  const paymentReliability = paymentTotal > 0 ? (ontime / paymentTotal) * 100 : null

  const excellentCare = driverProfile?.excellent_care ?? 0
  const damageEvents = (driverProfile?.damage_incidents ?? 0) + (driverProfile?.accidents ?? 0)
  const careTotal = excellentCare + damageEvents
  const vehicleCare = careTotal > 0 ? (excellentCare / careTotal) * 100 : null

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content style={styles.headerContent}>
          {profile?.photo_url ? (
            <Avatar.Image size={56} source={{ uri: profile.photo_url }} />
          ) : (
            <Avatar.Text size={56} label={getInitials(profile?.full_name)} />
          )}
          <View style={styles.headerText}>
            <Text variant="titleLarge" style={styles.headerName}>
              {profile?.full_name ?? 'Driver'}
            </Text>
            <Text variant="bodySmall" style={styles.headerVehicle}>
              {car ? `${car.make} ${car.model}` : 'Vehicle unavailable'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.trustHeaderRow}>
            <View style={styles.trustHeaderText}>
              <SectionLabel icon="shield-star" label="TRUSTSCORE" />
              {paymentReliability != null && <ReliabilityBar label="Payment Reliability" percent={paymentReliability} />}
              {vehicleCare != null && <ReliabilityBar label="Vehicle Care" percent={vehicleCare} />}
            </View>
            <TrustScoreRing score={driverProfile?.trust_score ?? 0} />
          </View>
        </Card.Content>
      </Card>

      {liveStatus ? (
        <LiveStatusMap
          liveStatus={liveStatus}
          addressLabel={addressLabel}
          height={320}
          photoUrl={profile?.photo_url}
          initials={profile?.full_name ?? undefined}
        />
      ) : (
        <Text variant="bodyMedium" style={styles.noLocation}>
          No location data yet for this driver.
        </Text>
      )}

      <SectionLabel icon="map-marker-distance" label="DISTANCE DRIVEN" />
      <View style={styles.statsRow}>
        <StatTile label="Today" value={`${(distanceTotals?.today ?? 0).toFixed(0)} km`} style={styles.tripleStat} />
        <StatTile label="This Week" value={`${(distanceTotals?.week ?? 0).toFixed(0)} km`} style={styles.tripleStat} />
        <StatTile label="This Month" value={`${(distanceTotals?.month ?? 0).toFixed(0)} km`} style={styles.tripleStat} />
      </View>
      <View style={styles.statsRow}>
        <StatTile
          label="Driving Today"
          value={formatDrivingTime(distanceTotals?.durationTodaySeconds ?? 0)}
          style={styles.tripleStat}
        />
        <StatTile
          label="Total Trips"
          value={String(lifetimeStats?.totalTrips ?? 0)}
          style={styles.tripleStat}
        />
        <StatTile
          label="Top Speed"
          value={`${(lifetimeStats?.topSpeedKmh ?? 0).toFixed(0)} km/h`}
          style={styles.tripleStat}
        />
      </View>

      <Card style={[styles.card, paymentsUpToDate && inspectionCompleted && !hasIncidents && styles.goodStandingCard]}>
        <Card.Content>
          <SectionLabel icon="shield-check" label="RENTAL HEALTH" />
          <Text variant="titleMedium" style={styles.healthTitle}>
            {paymentsUpToDate && inspectionCompleted && !hasIncidents ? 'Good Standing' : 'Needs Attention'}
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
          <SectionLabel icon="cash-multiple" label="PAYMENTS" />
          <Text variant="titleLarge" style={styles.paymentAmount}>
            R{car?.price_per_week ?? 0}/week
          </Text>
          {nextPayment && (
            <Text variant="bodySmall" style={styles.detail}>
              Next payment due {formatShortDate(nextPayment)}
            </Text>
          )}
          {(driverProfile?.consecutive_payments ?? 0) > 0 && (
            <Text variant="bodyMedium" style={styles.streak}>
              🔥 {driverProfile?.consecutive_payments}-week streak
            </Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <SectionLabel icon="car-wrench" label="VEHICLE CONDITION & NEXT SERVICE" />
          <Text variant="bodyMedium" style={styles.detail}>
            Last inspection: {lastInspection?.created_at ? formatShortDate(new Date(lastInspection.created_at)) : 'None yet'}
          </Text>
          {nextInspection && (
            <Text variant="bodyMedium" style={styles.detail}>
              Next inspection: {formatShortDate(nextInspection)}
            </Text>
          )}
          <Text variant="bodySmall" style={styles.detail}>
            Next service: {car?.next_service_date ? formatShortDate(new Date(car.next_service_date)) : 'Not scheduled'}
          </Text>
          <TextInput
            label="Next service date (YYYY-MM-DD)"
            value={nextServiceInput}
            onChangeText={setNextServiceInput}
            placeholder="2026-08-15"
            style={styles.dateInput}
          />
          <Button
            mode="contained-tonal"
            loading={updateNextServiceDate.isPending}
            onPress={() => {
              const trimmed = nextServiceInput.trim()
              if (trimmed && !/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
                Alert.alert('Invalid date', 'Please use the format YYYY-MM-DD, e.g. 2026-08-15.')
                return
              }
              updateNextServiceDate.mutate(trimmed || null)
            }}
          >
            Save
          </Button>
          <Button
            mode="outlined"
            icon="camera-plus-outline"
            style={styles.referencePhotosButton}
            onPress={() => router.push(`/owner/driver/reference-photos?carId=${carId}`)}
          >
            Manage Reference Photos
          </Button>
        </Card.Content>
      </Card>

      <SectionLabel icon="road-variant" label="ALL TRIPS" />
      {trips && trips.length > 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            {trips.map((trip, index) => (
              <TripRouteRow
                key={trip.id}
                tripNumber={index + 1}
                startLabel={trip.start_location ?? 'Unknown location'}
                endLabel={trip.end_location ?? 'Unknown location'}
                startTime={trip.started_at}
                distanceKm={trip.distance_km ?? 0}
                durationSeconds={trip.duration_seconds ?? 0}
                maxSpeedKmh={trip.max_speed_kmh ?? 0}
                onPress={() => router.push(`/owner/driver/trip/${trip.id}`)}
              />
            ))}
          </Card.Content>
        </Card>
      ) : (
        <Text variant="bodyMedium" style={styles.empty}>
          No completed trips yet.
        </Text>
      )}

      <SectionLabel icon="clipboard-check-outline" label="INSPECTIONS" />
      {inspections && inspections.length > 0 ? (
        inspections.map((inspection) => (
          <InspectionReviewCard key={inspection.id} inspection={inspection} driverId={id} />
        ))
      ) : (
        <Text variant="bodyMedium" style={styles.empty}>
          No inspections submitted yet.
        </Text>
      )}

      <SectionLabel icon="alert-octagon-outline" label="TRAFFIC OFFENCES" />
      {offences && offences.length > 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            {offences.map((offence) => (
              <TrafficOffenceRow key={offence.id} offence={offence} />
            ))}
          </Card.Content>
        </Card>
      ) : (
        <Text variant="bodyMedium" style={styles.empty}>
          No traffic offences on record.
        </Text>
      )}
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
  headerCard: {
    backgroundColor: brandColors.deep,
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  headerName: {
    color: '#fff',
  },
  headerVehicle: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  noLocation: {
    marginVertical: 16,
    textAlign: 'center',
    opacity: 0.6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  tripleStat: {
    width: '31%',
  },
  card: {
    marginBottom: 16,
  },
  trustHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trustHeaderText: {
    flex: 1,
    marginRight: 16,
  },
  goodStandingCard: {
    borderColor: brandColors.emerald,
    borderWidth: 1,
  },
  healthTitle: {
    color: brandColors.deep,
    marginBottom: 12,
  },
  checklist: {
    gap: 8,
  },
  detail: {
    opacity: 0.6,
    marginTop: 4,
  },
  paymentAmount: {
    marginTop: 4,
    color: brandColors.deep,
  },
  streak: {
    marginTop: 8,
  },
  dateInput: {
    marginTop: 12,
    marginBottom: 12,
  },
  referencePhotosButton: {
    marginTop: 12,
  },
  empty: {
    opacity: 0.6,
    marginBottom: 24,
  },
})
