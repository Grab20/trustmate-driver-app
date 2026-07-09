import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

type AuthState = {
  session: Session | null
  isInitializing: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => {
  supabase.auth.getSession().then(({ data }) => {
    set({ session: data.session, isInitializing: false })
  })

  supabase.auth.onAuthStateChange((_event, session) => {
    set({ session, isInitializing: false })
  })

  return {
    session: null,
    isInitializing: true,
    signIn: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error: error?.message ?? null }
    },
    signOut: async () => {
      await supabase.auth.signOut()
    },
  }
})
