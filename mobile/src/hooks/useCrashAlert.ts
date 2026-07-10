import { useEffect, useState } from 'react'
import { getAutoTripState, setAutoTripState } from '../lib/autoTripStorage'

const POLL_INTERVAL_MS = 3000

export function useCrashAlert() {
  const [pendingSince, setPendingSince] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    async function poll() {
      const state = await getAutoTripState()
      if (!cancelled) setPendingSince(state.crashPendingAt)
    }

    poll()
    const interval = setInterval(poll, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  async function confirmOk() {
    const state = await getAutoTripState()
    await setAutoTripState({ ...state, crashPendingAt: null })
    setPendingSince(null)
  }

  return { pendingSince, confirmOk }
}
