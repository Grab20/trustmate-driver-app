import { View, StyleSheet, FlatList } from 'react-native'
import { Text } from 'react-native-paper'
import { useMyTrafficOffences } from '../../src/hooks/useTrafficOffences'
import { TrafficOffenceRow } from '../../src/components/TrafficOffenceRow'
import { LoadingScreen } from '../../src/components/LoadingScreen'

export default function TrafficOffencesScreen() {
  const { data: offences, isLoading } = useMyTrafficOffences()

  if (isLoading) return <LoadingScreen />

  return (
    <View style={styles.container}>
      <FlatList
        data={offences}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TrafficOffenceRow offence={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text variant="bodyMedium" style={styles.empty}>
            No traffic offences on record.
          </Text>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  empty: {
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 32,
  },
})
