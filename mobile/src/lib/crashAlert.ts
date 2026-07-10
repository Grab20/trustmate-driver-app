import { supabase } from './supabase'
import { reverseGeocodeLabel } from './reverseGeocode'
import type { AutoTripContext } from './autoTripStorage'

export async function reportPossibleCrash(
  context: AutoTripContext,
  speedBeforeKmh: number,
  sample: { latitude: number; longitude: number },
): Promise<void> {
  const locationLabel = await reverseGeocodeLabel(sample.latitude, sample.longitude)

  const { data: driverProfile } = await supabase
    .from('driver_profiles')
    .select('id')
    .eq('user_id', context.driverId)
    .maybeSingle()

  const { error: incidentError } = await supabase.from('incidents').insert({
    reporter_id: context.driverId,
    driver_id: driverProfile?.id ?? null,
    incident_type: 'accident',
    description: `Auto-detected possible accident near ${locationLabel}. Speed before: ${speedBeforeKmh.toFixed(0)} km/h. Driver did not confirm safety within the countdown.`,
  })
  if (incidentError) console.warn('Crash alert: failed to log incident', incidentError.message)

  const { data: admins, error: adminsError } = await supabase.from('profiles').select('id').eq('is_admin', true)
  if (adminsError) {
    console.warn('Crash alert: failed to look up admins', adminsError.message)
    return
  }

  for (const admin of admins ?? []) {
    const { error: pushError } = await supabase.functions.invoke('send-push-notification', {
      body: {
        user_id: admin.id,
        title: 'Possible Accident Detected',
        body: `A driver may have been in an accident near ${locationLabel}.`,
        data: { type: 'crash_alert' },
      },
    })
    if (pushError) console.warn('Crash alert: failed to notify admin', pushError.message)
  }
}
