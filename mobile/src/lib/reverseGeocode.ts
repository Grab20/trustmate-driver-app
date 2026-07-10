import * as Location from 'expo-location'

export async function reverseGeocodeLabel(latitude: number, longitude: number): Promise<string> {
  const fallback = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude })
    const address = results[0]
    if (!address) return fallback

    const streetPart = [address.streetNumber, address.street].filter(Boolean).join(' ')
    const areaPart = address.city ?? address.subregion ?? address.region

    if (streetPart && areaPart) return `${streetPart}, ${areaPart}`
    if (areaPart) return areaPart
    if (streetPart) return streetPart
    return fallback
  } catch {
    return fallback
  }
}
