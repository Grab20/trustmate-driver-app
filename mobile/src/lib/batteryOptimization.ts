import { Platform } from 'react-native'
import * as IntentLauncher from 'expo-intent-launcher'
import * as Application from 'expo-application'

// Android (Samsung devices especially) can silently kill the background
// location foreground service within minutes of the app leaving the
// foreground even with location permission fully granted — there's no error
// or callback anywhere in the app for this, it just stops producing samples.
// This opens the system dialog that lets the driver exempt the app from that
// battery management in one tap.
export async function requestIgnoreBatteryOptimizations(): Promise<void> {
  if (Platform.OS !== 'android') return
  const packageName = Application.applicationId
  if (!packageName) return
  try {
    await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, {
      data: `package:${packageName}`,
    })
  } catch {
    // Some OEMs (or a device already exempted) reject the direct request —
    // fall back to the general list so the driver can still find the app manually.
    try {
      await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS)
    } catch {
      // Nothing more we can do from here — findable in system Settings manually.
    }
  }
}
