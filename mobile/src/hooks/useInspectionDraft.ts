import { useCallback, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

function draftStorageKey(carId: string): string {
  return `inspection-draft:${carId}`
}

// Persists {shotKey: uploadedStoragePath} to AsyncStorage as each shot is
// captured, so if the native camera causes Android to kill the app mid
// walkaround, reopening "New Inspection" for the same car rehydrates
// already-captured shots instead of starting the whole 12-photo sequence
// over from scratch.
export function useInspectionDraft(carId: string | undefined) {
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!carId) {
      setDraft({})
      setIsLoaded(true)
      return
    }
    setIsLoaded(false)
    AsyncStorage.getItem(draftStorageKey(carId))
      .then((raw) => {
        if (cancelled) return
        setDraft(raw ? (JSON.parse(raw) as Record<string, string>) : {})
        setIsLoaded(true)
      })
      .catch(() => {
        if (!cancelled) setIsLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [carId])

  const saveShot = useCallback(
    (shotKey: string, path: string) => {
      if (!carId) return
      setDraft((prev) => {
        const next = { ...prev, [shotKey]: path }
        AsyncStorage.setItem(draftStorageKey(carId), JSON.stringify(next)).catch(() => {})
        return next
      })
    },
    [carId],
  )

  const clear = useCallback(async () => {
    if (!carId) return
    setDraft({})
    await AsyncStorage.removeItem(draftStorageKey(carId)).catch(() => {})
  }, [carId])

  return { draft, isLoaded, saveShot, clear }
}
