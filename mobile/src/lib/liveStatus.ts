import { supabase } from './supabase'
import type { AutoTripContext } from './autoTripStorage'

export async function upsertLiveStatus(
  context: AutoTripContext,
  isMoving: boolean,
  speedKmh: number,
  sample: { latitude: number; longitude: number },
): Promise<void> {
  const { data: existing } = await supabase
    .from('driver_live_status')
    .select('is_moving, state_since')
    .eq('driver_id', context.driverId)
    .maybeSingle()

  const stateSince = existing && existing.is_moving === isMoving ? existing.state_since : new Date().toISOString()

  const { error } = await supabase.from('driver_live_status').upsert(
    {
      driver_id: context.driverId,
      car_id: context.carId,
      lat: sample.latitude,
      lng: sample.longitude,
      speed_kmh: speedKmh,
      is_moving: isMoving,
      state_since: stateSince,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'driver_id' },
  )
  if (error) console.warn('Live status: failed to upsert', error.message)
}
