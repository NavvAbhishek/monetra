import { create } from 'zustand'
import type { AuthStatus, AuthUser } from '@/types/auth'

interface AuthState {
  user: AuthUser | null
  status: AuthStatus
  /** Called by the auth listener (mock or Firebase) whenever the session changes. */
  setUser: (user: AuthUser | null) => void
  reset: () => void
}

// Not persisted: the backend (mock db / Firebase Auth) is the source of truth for the session.
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  status: 'loading',
  setUser: (user) => set({ user, status: user ? 'signedIn' : 'signedOut' }),
  reset: () => set({ user: null, status: 'signedOut' }),
}))
