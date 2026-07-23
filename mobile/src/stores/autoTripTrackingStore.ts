import { create } from 'zustand'

export type AutoTripPermissionStatus = 'unknown' | 'granted' | 'denied'

type AutoTripTrackingState = {
  status: AutoTripPermissionStatus
  setStatus: (status: AutoTripPermissionStatus) => void
}

// useAutoTripTracking's permission result is mounted once at the app-shell
// layout, but the driver needs to see (and act on) a denial from screens
// further down the tree — a store lets any screen read it without
// re-invoking the permission-request side effects.
export const useAutoTripTrackingStore = create<AutoTripTrackingState>((set) => ({
  status: 'unknown',
  setStatus: (status) => set({ status }),
}))
