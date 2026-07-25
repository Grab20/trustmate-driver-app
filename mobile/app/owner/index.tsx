import { View, ScrollView, StyleSheet, Pressable } from 'react-native'
import { Text, Button } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { useOwnerFleetSummary } from '../../src/hooks/useOwnerFleetSummary'
import { useOwnerFleetDistanceTotals } from '../../src/hooks/useOwnerFleetDistanceTotals'
import { useOwnerCars } from '../../src/hooks/useOwnerCars'
import { useMyProfile } from '../../src/hooks/useMyProfile'
import { useAuthStore } from '../../src/stores/authStore'
import { LoadingScreen } from '../../src/components/LoadingScreen'
import { brandColors, radius, cardShadow } from '../../src/theme/theme'

const REVIEW_LABELS: Record<string, string> = {
  flagged: 'inspection flagged',
  reinspection_requested: 're-inspection requested',
}

export default function OwnerDashboardScreen() {
  const router = useRouter()
  const { data: fleet, isLoading } = useOwnerFleetSummary()
  const { data: distanceTotals } = useOwnerFleetDistanceTotals()
  const { data: ownerCars } = useOwnerCars()
  const { data: profile } = useMyProfile()
  const signOut = useAuthStore((s) => s.signOut)

  if (isLoading) return <LoadingScreen />

  const attentionItems = (fleet ?? []).flatMap((entry) => {
    const items: { key: string; title: string; subtitle: string }[] = []
    const reviewLabel = entry.lastInspection ? REVIEW_LABELS[entry.lastInspection.reviewStatus] : undefined
    if (reviewLabel) {
      items.push({
        key: `${entry.driverId}-inspection`,
        title: `${entry.driverName.split(' ')[0]} — ${reviewLabel}`,
        subtitle: entry.carLabel,
      })
    }
    if (entry.missedPayments > 0) {
      items.push({
        key: `${entry.driverId}-payment`,
        title: `${entry.driverName.split(' ')[0]} — payment missed`,
        subtitle: entry.carLabel,
      })
    }
    return items
  })

  const fleetDistanceThisWeek = distanceTotals?.week ?? 0
  const fleetPaymentsThisWeek = (fleet ?? []).reduce((sum, entry) => sum + entry.priceWeek, 0)

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.greet}>Your fleet</Text>
      <Text style={styles.name}>
        {fleet?.length ?? 0} vehicle{(fleet?.length ?? 0) === 1 ? '' : 's'}
      </Text>

      {profile?.role === 'both' && (
        <Button mode="outlined" onPress={() => router.push('/')} style={styles.switchButton}>
          Switch to Driver View
        </Button>
      )}

      {ownerCars && ownerCars.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>YOUR CARS</Text>
          <View style={styles.listCard}>
            {ownerCars.map((car, index) => (
              <Pressable
                key={car.id}
                onPress={() => router.push(`/owner/driver/reference-photos?carId=${car.id}`)}
                style={[styles.driverRow, index === ownerCars.length - 1 && styles.driverRowLast]}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{(car.make?.[0] ?? '') + (car.model?.[0] ?? '')}</Text>
                </View>
                <View style={styles.driverInfo}>
                  <Text style={styles.driverName}>
                    {car.make} {car.model}
                  </Text>
                  <Text style={styles.driverSub}>{car.status === 'rented' ? 'Rented' : 'Available'} · Manage reference photos</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {fleet && fleet.length > 0 ? (
        <>
          {attentionItems.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>NEEDS YOUR ATTENTION</Text>
              <View style={styles.card}>
                {attentionItems.map((item, index) => (
                  <View
                    key={item.key}
                    style={[styles.attnRow, index === attentionItems.length - 1 && styles.attnRowLast]}
                  >
                    <View style={styles.attnDot} />
                    <View style={styles.attnText}>
                      <Text style={styles.attnTitle}>{item.title}</Text>
                      <Text style={styles.attnSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          <Text style={styles.sectionLabel}>DRIVERS</Text>
          <View style={styles.listCard}>
            {fleet.map((entry, index) => (
              <Pressable
                key={entry.applicationId}
                onPress={() =>
                  router.push({
                    pathname: '/owner/driver/[id]',
                    params: { id: entry.driverId, carId: entry.carId ?? '' },
                  })
                }
                style={[styles.driverRow, index === fleet.length - 1 && styles.driverRowLast]}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {entry.driverName
                      .split(' ')
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                  </Text>
                </View>
                <View style={styles.driverInfo}>
                  <Text style={styles.driverName}>{entry.driverName}</Text>
                  <Text style={styles.driverSub}>
                    {entry.carLabel} · {entry.isMoving ? 'Driving' : 'Parked'}
                  </Text>
                </View>
                <View style={styles.driverFigure}>
                  <Text style={styles.dfNum}>{entry.trustScore ?? '—'}</Text>
                  <Text style={styles.dfLabel}>TRUST</Text>
                </View>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionLabel}>THIS WEEK</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardFirst]}>
              <Text style={styles.statLabel}>Fleet distance</Text>
              <Text style={styles.statValue}>{fleetDistanceThisWeek.toFixed(0)} km</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Payments</Text>
              <Text style={styles.statValue}>R{fleetPaymentsThisWeek.toLocaleString()}</Text>
            </View>
          </View>
        </>
      ) : (
        <Text style={styles.empty}>
          No matched drivers yet. Once a driver is matched to one of your vehicles on the TrustMate
          website, they'll appear here.
        </Text>
      )}

      <Button mode="outlined" onPress={signOut} style={styles.signOutButton}>
        Sign Out
      </Button>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: brandColors.paper,
  },
  container: {
    padding: 24,
  },
  greet: {
    color: brandColors.charcoalSoft,
    fontSize: 14,
  },
  name: {
    color: brandColors.charcoal,
    fontSize: 26,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 16,
  },
  switchButton: {
    marginBottom: 16,
  },
  sectionLabel: {
    color: brandColors.charcoalSoft,
    letterSpacing: 0.5,
    fontSize: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  card: {
    backgroundColor: brandColors.cardGreen,
    borderRadius: radius.lg,
    padding: 20,
    marginBottom: 8,
    ...cardShadow,
  },
  attnRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  attnRowLast: {
    paddingBottom: 0,
    marginBottom: 0,
    borderBottomWidth: 0,
  },
  attnDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: brandColors.alert,
    marginTop: 5,
  },
  attnText: {
    flex: 1,
  },
  attnTitle: {
    color: brandColors.inkOnCard,
    fontWeight: '700',
  },
  attnSubtitle: {
    color: brandColors.inkOnCardSoft,
    marginTop: 2,
  },
  listCard: {
    backgroundColor: brandColors.surface,
    borderRadius: radius.lg,
    marginBottom: 8,
    overflow: 'hidden',
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brandColors.line,
  },
  driverRowLast: {
    borderBottomWidth: 0,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: brandColors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: brandColors.deep,
    fontWeight: '700',
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    color: brandColors.charcoal,
    fontWeight: '700',
  },
  driverSub: {
    color: brandColors.charcoalSoft,
    marginTop: 2,
    fontSize: 13,
  },
  driverFigure: {
    alignItems: 'center',
  },
  dfNum: {
    color: brandColors.deep,
    fontWeight: '700',
    fontSize: 18,
  },
  dfLabel: {
    color: brandColors.charcoalSoft,
    fontSize: 10,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: brandColors.cardGreen,
    borderRadius: radius.lg,
    padding: 16,
    ...cardShadow,
  },
  statCardFirst: {},
  statLabel: {
    color: brandColors.inkOnCardSoft,
    fontSize: 12,
    marginBottom: 6,
  },
  statValue: {
    color: brandColors.inkOnCard,
    fontSize: 20,
    fontWeight: '700',
  },
  empty: {
    color: brandColors.charcoalSoft,
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  signOutButton: {
    marginTop: 16,
  },
})
