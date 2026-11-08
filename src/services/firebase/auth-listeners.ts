import type { User } from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase'
import type { AuthUser } from '@/types/auth'

export const toAuthUser = (user: User): AuthUser => ({
  uid: user.uid,
  email: user.email ?? '',
  name: user.displayName || user.email?.split('@')[0] || 'Friend',
  photoURL: user.photoURL,
  hasPassword: user.providerData.some((p) => p.providerId === 'password'),
})

type Listener = (user: AuthUser | null) => void
export const listeners = new Set<Listener>()

/**
 * Firebase doesn't report display-name changes, so the profile service calls this after a rename
 * (the sidebar shows the new name straight away).
 */
export const notifyAuthUserChanged = () => {
  const user = getFirebaseAuth().currentUser
  listeners.forEach((listener) => listener(user ? toAuthUser(user) : null))
}

/**
 * While a sign-up / first Google sign-in is creating the profile + default categories, the
 * session listener waits — so the app never opens the dashboard on a half-created account.
 */
let pendingSetup: Promise<unknown> = Promise.resolve()

export const runAccountSetup = <T>(work: () => Promise<T>): Promise<T> => {
  const run = work()
  pendingSetup = run.catch(() => undefined)
  return run
}

export const waitForAccountSetup = () => pendingSetup
