// Thin re-export of the Damoov Telematics SDK's React Native bridge, so the
// rest of the app imports from `lib/damoov` the same way it imports Supabase
// from `lib/supabase.ts`, instead of reaching into the third-party package
// directly. Deliberately not more than a re-export: the SDK's own API is
// already the right shape for how useDamoovTelemetry uses it.
export { default as telematicsSdk } from 'react-native-telematics'
export {
  addOnLocationChangedListener,
  addOnTrackingStateChangedListener,
  addOnSpeedViolationListener,
} from 'react-native-telematics'
export type { LocationChangedEvent, SpeedViolationEvent } from 'react-native-telematics'
