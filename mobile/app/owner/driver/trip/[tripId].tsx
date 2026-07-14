import { useLocalSearchParams } from 'expo-router'
import { TripDetailView } from '../../../../src/components/TripDetailView'

export default function OwnerTripDetailScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>()
  return <TripDetailView tripId={tripId} />
}
