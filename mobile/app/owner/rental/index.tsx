import { View, ScrollView, StyleSheet, Pressable } from 'react-native'
import { Text, Icon } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { useOwnerFleetSummary } from '../../../src/hooks/useOwnerFleetSummary'
import { LoadingScreen } from '../../../src/components/LoadingScreen'
import { brandColors, radius, cardShadow } from '../../../src/theme/theme'

function formatSince(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
}

export default function OwnerRentalScreen() {
  const router = useRouter()
  const { data: fleet, isLoading } = useOwnerFleetSummary()

  if (isLoading) return <LoadingScreen />

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.sectionLabel}>YOUR DRIVERS</Text>
      {fleet && fleet.length > 0 ? (
        <View style={styles.listCard}>
          {fleet.map((entry, index) => (
            <Pressable
              key={entry.applicationId}
              onPress={() =>
                router.push({
                  pathname: '/owner/rental/[driverId]',
                  params: { driverId: entry.driverId, carId: entry.carId ?? '' },
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
                  {entry.carLabel}
                  {entry.matchedAt ? ` · since ${formatSince(entry.matchedAt)}` : ''}
                </Text>
              </View>
              <Icon source="chevron-right" size={20} color={brandColors.charcoalSoft} />
            </Pressable>
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>No matched drivers yet.</Text>
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
  },
  sectionLabel: {
    color: brandColors.charcoalSoft,
    letterSpacing: 0.5,
    fontSize: 12,
    marginBottom: 12,
  },
  listCard: {
    backgroundColor: brandColors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...cardShadow,
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
  empty: {
    color: brandColors.charcoalSoft,
    textAlign: 'center',
    marginTop: 32,
  },
})
