import { View, ScrollView, StyleSheet, Pressable } from 'react-native'
import { Text } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { useOwnerFleetSummary } from '../../src/hooks/useOwnerFleetSummary'
import { LoadingScreen } from '../../src/components/LoadingScreen'
import { brandColors, radius, cardShadow } from '../../src/theme/theme'

function firstName(fullName: string): string {
  return fullName.split(' ')[0]
}

export default function OwnerInspectionScreen() {
  const router = useRouter()
  const { data: fleet, isLoading } = useOwnerFleetSummary()

  if (isLoading) return <LoadingScreen />

  const checklistItems = (fleet ?? []).map((entry) => {
    if (entry.missedPayments > 0) {
      return { key: `${entry.driverId}-pay`, ok: false, text: `${firstName(entry.driverName)}'s payment is overdue` }
    }
    if (!entry.lastInspection) {
      return { key: `${entry.driverId}-insp`, ok: false, text: `${firstName(entry.driverName)}'s inspection not submitted yet` }
    }
    if (entry.lastInspection.reviewStatus === 'flagged' || entry.lastInspection.reviewStatus === 'reinspection_requested') {
      return { key: `${entry.driverId}-insp`, ok: false, text: `${firstName(entry.driverName)}'s inspection flagged — review needed` }
    }
    return { key: `${entry.driverId}-insp`, ok: true, text: `${firstName(entry.driverName)}'s inspection completed` }
  })
  const allPaymentsOk = (fleet ?? []).every((entry) => entry.missedPayments === 0)

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {fleet && fleet.length > 0 ? (
        <>
          <Text style={styles.sectionLabel}>RENTAL HEALTH</Text>
          <View style={styles.card}>
            <View style={styles.checkRow}>
              <View style={[styles.checkMark, allPaymentsOk ? styles.checkOk : styles.checkAlert]}>
                <Text style={styles.checkMarkText}>{allPaymentsOk ? '✓' : '!'}</Text>
              </View>
              <Text style={styles.checkText}>
                {allPaymentsOk ? 'All vehicles up to date on payment' : 'Some vehicles have a payment overdue'}
              </Text>
            </View>
            {checklistItems.map((item, index) => (
              <View
                key={item.key}
                style={[styles.checkRow, index === checklistItems.length - 1 && styles.checkRowLast]}
              >
                <View style={[styles.checkMark, item.ok ? styles.checkOk : styles.checkAlert]}>
                  <Text style={styles.checkMarkText}>{item.ok ? '✓' : '!'}</Text>
                </View>
                <Text style={styles.checkText}>{item.text}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionLabel}>VEHICLE HEALTH REPORTS</Text>
          <View style={styles.listCard}>
            {fleet.map((entry, index) => (
              <Pressable
                key={entry.applicationId}
                disabled={!entry.lastInspection}
                onPress={() =>
                  entry.lastInspection &&
                  router.push({
                    pathname: '/owner/driver/inspection/[inspectionId]',
                    params: { inspectionId: entry.lastInspection.id, driverId: entry.driverId, carId: entry.carId ?? '' },
                  })
                }
                style={[styles.reportRow, index === fleet.length - 1 && styles.reportRowLast]}
              >
                <View style={[styles.avatar, entry.lastInspection?.healthScore != null && entry.lastInspection.healthScore < 90 && styles.avatarAlert]}>
                  <Text style={styles.avatarText}>{entry.carLabel.slice(0, 2).toUpperCase()}</Text>
                </View>
                <View style={styles.reportInfo}>
                  <Text style={styles.reportName}>{entry.carLabel}</Text>
                  <Text style={styles.reportSub}>
                    {entry.lastInspection
                      ? `Inspection #${entry.lastInspection.inspectionNumber} · ${new Date(entry.lastInspection.createdAt ?? '').toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`
                      : 'No inspection yet'}
                  </Text>
                </View>
                {entry.lastInspection?.healthScore != null && (
                  <View style={[styles.scorePill, entry.lastInspection.healthScore < 90 ? styles.scorePillAlert : styles.scorePillGood]}>
                    <Text
                      style={[
                        styles.scorePillText,
                        entry.lastInspection.healthScore < 90 ? styles.scorePillTextAlert : styles.scorePillTextGood,
                      ]}
                    >
                      {entry.lastInspection.healthScore}/100
                    </Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </>
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
    marginTop: 8,
    marginBottom: 12,
  },
  card: {
    backgroundColor: brandColors.surface,
    borderRadius: radius.lg,
    padding: 20,
    marginBottom: 8,
    ...cardShadow,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brandColors.line,
  },
  checkRowLast: {
    paddingBottom: 0,
    marginBottom: 0,
    borderBottomWidth: 0,
  },
  checkMark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOk: {
    backgroundColor: brandColors.successSoft,
  },
  checkAlert: {
    backgroundColor: brandColors.alertSoft,
  },
  checkMarkText: {
    fontWeight: '700',
    fontSize: 12,
    color: brandColors.deep,
  },
  checkText: {
    color: brandColors.charcoal,
    flex: 1,
  },
  listCard: {
    backgroundColor: brandColors.surface,
    borderRadius: radius.lg,
    marginBottom: 8,
    overflow: 'hidden',
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brandColors.line,
  },
  reportRowLast: {
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
  avatarAlert: {
    backgroundColor: brandColors.alertSoft,
  },
  avatarText: {
    color: brandColors.deep,
    fontWeight: '700',
    fontSize: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportName: {
    color: brandColors.charcoal,
    fontWeight: '700',
  },
  reportSub: {
    color: brandColors.charcoalSoft,
    marginTop: 2,
    fontSize: 13,
  },
  scorePill: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  scorePillGood: {
    backgroundColor: brandColors.successSoft,
  },
  scorePillAlert: {
    backgroundColor: brandColors.alertSoft,
  },
  scorePillText: {
    fontWeight: '700',
    fontSize: 12,
  },
  scorePillTextGood: {
    color: brandColors.deep,
  },
  scorePillTextAlert: {
    color: brandColors.alert,
  },
  empty: {
    color: brandColors.charcoalSoft,
    textAlign: 'center',
    marginTop: 32,
  },
})
