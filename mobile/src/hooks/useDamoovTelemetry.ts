import { useEffect } from 'react'
import { Platform } from 'react-native'
import { useActiveRental } from './useActiveRental'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import {
  telematicsSdk,
  addOnLocationChangedListener,
  addOnTrackingStateChangedListener,
  addOnSpeedViolationListener,
  type SpeedViolationEvent,
} from '../lib/damoov/telematicsSdk'

// Android only for now -- the product decision (not a technical one) is to
// ship the Damoov module on Android first and add iOS in a later phase.
// This hook is a no-op everywhere else, so it's safe to mount unconditionally
// once wired into the driver layout.
const DAMOOV_PLATFORM_SUPPORTED = Platform.OS === 'android'

// Damoov's own device-id model expects a value TrustMate's backend already
// knows -- there's no separate "Damoov user" to create up front, so the auth
// user id doubles as the device id. One device per driver matches how this
// app already works (single account, single phone).
function damoovDeviceIdFor(driverId: string) {
  return driverId
}

async function upsertTelematicsAccount(
  driverId: string,
  patch: Partial<{
    sdk_status: string
    damoov_device_token: string
    damoov_user_id: string
    consent_given_at: string
    connected_at: string
    last_seen_at: string
  }>,
) {
  await supabase
    .from('driver_telematics_accounts')
    .upsert({ driver_id: driverId, ...patch }, { onConflict: 'driver_id' })
}

export function useDamoovTelemetry() {
  const userId = useAuthStore((s) => s.session?.user.id)
  const { data: activeRental } = useActiveRental()

  const carId = activeRental?.car_id
  const applicationId = activeRental?.id

  useEffect(() => {
    if (!DAMOOV_PLATFORM_SUPPORTED) return
    if (!userId || !carId || !applicationId) return

    let cancelled = false

    async function start() {
      const driverId = userId as string
      try {
        await telematicsSdk.initializeSdk()
        const initialized = await telematicsSdk.isInitializedSdk()
        if (!initialized || cancelled) return

        const deviceId = damoovDeviceIdFor(driverId)
        await telematicsSdk.setDeviceId(deviceId)

        const permissionsGranted = await telematicsSdk.showPermissionWizard()
        if (cancelled) return

        if (!permissionsGranted) {
          await upsertTelematicsAccount(driverId, {
            sdk_status: 'disabled',
            damoov_device_token: deviceId,
          })
          return
        }

        await telematicsSdk.setEnableSdk(true)
        // Session-bound start/stop rather than a scheduled or Bluetooth
        // trigger -- Damoov's own docs describe this as the right mode for
        // "time-bound scenarios like rentals". Individual trips within the
        // session are still detected automatically by the native engine;
        // this call starts the tracking session, not each trip.
        await telematicsSdk.startManualTracking()
        if (cancelled) return

        const now = new Date().toISOString()
        await upsertTelematicsAccount(driverId, {
          sdk_status: 'enabled',
          damoov_device_token: deviceId,
          damoov_user_id: deviceId,
          consent_given_at: now,
          connected_at: now,
          last_seen_at: now,
        })
      } catch {
        // Non-fatal: initialization can fail before Damoov commercial
        // credentials are configured natively (see AGENTS.md / blueprint
        // §05 -- InstanceId/InstanceKey wiring is still an open item).
        // Never let a Damoov failure break driver-facing app usage.
      }
    }

    start()

    return () => {
      cancelled = true
    }
  }, [userId, carId, applicationId])

  useEffect(() => {
    if (!DAMOOV_PLATFORM_SUPPORTED) return
    if (!userId || !carId || !applicationId) return

    const locationSub = addOnLocationChangedListener(({ latitude, longitude }) => {
      supabase
        .from('telematics_live_status')
        .upsert(
          {
            driver_id: userId,
            car_id: carId,
            application_id: applicationId,
            lat: latitude,
            lng: longitude,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'driver_id' },
        )
        .then(() => {})
    })

    const trackingStateSub = addOnTrackingStateChangedListener(() => {
      // Reserved: reflects whether the tracking *session* is active, which
      // is a different thing from "a trip is currently in progress" -- not
      // wired to is_moving here to avoid writing a misleading value.
    })

    const speedViolationSub = addOnSpeedViolationListener((event: SpeedViolationEvent) => {
      const occurredAt = new Date(event.date).toISOString()
      supabase
        .from('telematics_live_status')
        .upsert(
          {
            driver_id: userId,
            car_id: carId,
            application_id: applicationId,
            lat: event.latitude,
            lng: event.longitude,
            speed_kmh: event.speed,
            is_moving: true,
            updated_at: occurredAt,
          },
          { onConflict: 'driver_id' },
        )
        .then(() => {})

      // Best-effort client-side event log. The authoritative source will be
      // Damoov's own webhook once commercial access is confirmed (blueprint
      // §06) -- this keeps a lightweight record in the meantime rather than
      // collecting nothing at all.
      supabase
        .from('telematics_events')
        .insert({
          driver_id: userId,
          car_id: carId,
          application_id: applicationId,
          event_type: 'speeding',
          severity: Math.max(0, event.speed - event.speedLimit),
          lat: event.latitude,
          lng: event.longitude,
          occurred_at: occurredAt,
        })
        .then(() => {})
    })

    return () => {
      locationSub.remove()
      trackingStateSub.remove()
      speedViolationSub.remove()
    }
  }, [userId, carId, applicationId])

  // Mirrors useAutoTripTracking's own dual-role safety net: a separate
  // empty-deps effect so teardown only fires on true unmount (sign-out, or
  // switching to Owner view), not on every rental-detail change the sync
  // effect above already handles.
  useEffect(() => {
    if (!DAMOOV_PLATFORM_SUPPORTED) return
    return () => {
      telematicsSdk
        .isTracking()
        .then((tracking) => (tracking ? telematicsSdk.stopManualTracking() : undefined))
        .catch(() => {})
    }
  }, [])
}
