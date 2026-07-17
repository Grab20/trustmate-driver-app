import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Card, Button } from 'react-native-paper'
import { useMyProfile } from '../../../src/hooks/useMyProfile'
import { useDriverProfile } from '../../../src/hooks/useDriverProfile'
import { useDriverRentalStats } from '../../../src/hooks/useDriverRentalStats'
import { useAuthStore } from '../../../src/stores/authStore'
import { LoadingScreen } from '../../../src/components/LoadingScreen'
import { TrustScoreRing } from '../../../src/components/TrustScoreRing'
import { ReliabilityBar } from '../../../src/components/ReliabilityBar'
import { brandColors, radius, cardShadow } from '../../../src/theme/theme'

function trustScoreLabel(score: number | null | undefined): string {
  if (score == null) return 'Not Rated'
  if (score >= 80) return 'Good Standing'
  if (score >= 50) return 'Fair Standing'
  return 'Needs Improvement'
}

function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

export default function AccountScreen() {
  const { data: myProfile, isLoading: isProfileLoading } = useMyProfile()
  const { data: driverProfile, isLoading: isDriverLoading } = useDriverProfile()
  const { data: rentalStats } = useDriverRentalStats()
  const signOut = useAuthStore((s) => s.signOut)

  if (isProfileLoading || isDriverLoading) return <LoadingScreen />

  const isVerified = Boolean(driverProfile?.id_verified && driverProfile?.license_verified)

  const ontime = driverProfile?.ontime_payments ?? 0
  const missed = driverProfile?.missed_payments ?? 0
  const late = driverProfile?.late_payments ?? 0
  const paymentTotal = ontime + missed + late
  const paymentReliability = paymentTotal > 0 ? (ontime / paymentTotal) * 100 : null

  const excellentCare = driverProfile?.excellent_care ?? 0
  const damageEvents = (driverProfile?.damage_incidents ?? 0) + (driverProfile?.accidents ?? 0)
  const careTotal = excellentCare + damageEvents
  const vehicleCare = careTotal > 0 ? (excellentCare / careTotal) * 100 : null

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerTop}>
            <View style={styles.avatar}>
              <Text variant="titleLarge" style={styles.avatarText}>
                {getInitials(myProfile?.full_name)}
              </Text>
            </View>
            <View style={styles.headerInfo}>
              <Text variant="titleLarge" style={styles.name}>
                {myProfile?.full_name ?? 'Driver'}
              </Text>
              {isVerified && (
                <Text variant="bodySmall" style={styles.verifiedBadge}>
                  ✓ Verified Driver
                </Text>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.trustRow}>
            <View>
              <Text variant="labelMedium" style={styles.label}>
                TRUSTSCORE
              </Text>
              <Text variant="bodyMedium" style={styles.trustStanding}>
                {trustScoreLabel(driverProfile?.trust_score)}
              </Text>
            </View>
            <TrustScoreRing score={driverProfile?.trust_score ?? 0} />
          </View>
        </Card.Content>
      </Card>

      {(paymentReliability != null || vehicleCare != null) && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="labelMedium" style={styles.label}>
              RELIABILITY SCORES
            </Text>
            {paymentReliability != null && (
              <ReliabilityBar label="Payment Reliability" percent={paymentReliability} />
            )}
            {vehicleCare != null && <ReliabilityBar label="Vehicle Care" percent={vehicleCare} />}
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="labelMedium" style={styles.label}>
            VERIFIED DRIVER RECORD
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statTile}>
              <Text variant="titleLarge" style={styles.statValue}>
                {driverProfile?.rentals_completed ?? 0}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Completed Rentals
              </Text>
            </View>
            <View style={styles.statTile}>
              <Text variant="titleLarge" style={styles.statValue}>
                {driverProfile?.months_with_owner ?? 0}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Months with Owner
              </Text>
            </View>
            <View style={styles.statTile}>
              <Text variant="titleLarge" style={styles.statValue}>
                {rentalStats?.previousOwnersCount ?? 0}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Previous Owners
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Button mode="outlined" onPress={signOut} style={styles.signOutButton} textColor={brandColors.charcoal}>
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
  headerCard: {
    backgroundColor: brandColors.cardGreen,
    borderRadius: radius.lg,
    marginBottom: 16,
    ...cardShadow,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: brandColors.inkOnCard,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    color: brandColors.inkOnCard,
  },
  verifiedBadge: {
    color: brandColors.gold,
    fontWeight: '700',
    marginTop: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 16,
  },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: brandColors.inkOnCardSoft,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  trustStanding: {
    color: brandColors.inkOnCard,
    fontWeight: '700',
    marginTop: 4,
  },
  card: {
    backgroundColor: brandColors.cardGreen,
    borderRadius: radius.lg,
    marginBottom: 16,
    ...cardShadow,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statTile: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: brandColors.inkOnCard,
  },
  statLabel: {
    color: brandColors.inkOnCardSoft,
    marginTop: 4,
    textAlign: 'center',
  },
  signOutButton: {
    marginTop: 8,
    marginBottom: 24,
    borderColor: brandColors.charcoalSoft,
  },
})
