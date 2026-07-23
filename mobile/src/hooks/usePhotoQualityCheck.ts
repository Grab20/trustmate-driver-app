import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export type PhotoCheckStatus = 'idle' | 'checking' | 'passed' | 'rejected'

export type PhotoCheckResult = {
  status: PhotoCheckStatus
  issues: string[]
}

type PhotoQualityCheckParams = {
  base64: string | null | undefined
  mimeType?: string | null
  shotKey: string
  carId: string | null | undefined
  referencePhotoPath?: string | null
}

// Real-time per-photo gate: called once right after each shot is taken, so a
// blurry photo or a mismatched vehicle is caught immediately instead of only
// surfacing in the post-submission report. A broken check (network error,
// missing config) fails open server-side, so this never gets stuck showing
// "rejected" for a reason unrelated to the photo itself.
export function usePhotoQualityCheck({
  base64,
  mimeType,
  shotKey,
  carId,
  referencePhotoPath,
}: PhotoQualityCheckParams): PhotoCheckResult {
  const [result, setResult] = useState<PhotoCheckResult>({ status: 'idle', issues: [] })

  useEffect(() => {
    let cancelled = false
    if (!base64 || !carId) {
      setResult({ status: 'idle', issues: [] })
      return
    }
    setResult({ status: 'checking', issues: [] })
    supabase.functions
      .invoke('check-inspection-photo', {
        body: { imageBase64: base64, mimeType: mimeType ?? 'image/jpeg', shotKey, carId, referencePhotoPath },
      })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || !data) {
          setResult({ status: 'passed', issues: [] })
          return
        }
        setResult({
          status: data.passed ? 'passed' : 'rejected',
          issues: Array.isArray(data.issues) ? data.issues : [],
        })
      })
      .catch(() => {
        if (!cancelled) setResult({ status: 'passed', issues: [] })
      })
    return () => {
      cancelled = true
    }
  }, [base64, carId, shotKey, referencePhotoPath, mimeType])

  return result
}
