import type { AuthUser } from '@/types/auth'
import type { Unsubscribe } from '../contracts'
import { loadDb, saveDb, type MockDb, type MockUser } from './db'
import { DEMO_UID, ensureDemoUser } from './seed'

/**
 * Mock session. "Keep me logged in" → localStorage (survives closing the browser),
 * otherwise sessionStorage (cleared when the tab closes) — same behaviour as Firebase persistence.
 */

const SESSION_KEY = 'monetra-mock-session'

/** Loads the db and makes sure the demo account exists. All mock services start here. */
export const getDb = (): MockDb => {
  const db = loadDb()
  if (!db.users.some((u) => u.uid === DEMO_UID)) {
    ensureDemoUser(db)
    saveDb()
  }
  return db
}

const readSession = (): string | null => {
  try {
    return sessionStorage.getItem(SESSION_KEY) ?? localStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

export const setSession = (uid: string, persist: boolean): void => {
  try {
    sessionStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(SESSION_KEY)
    ;(persist ? localStorage : sessionStorage).setItem(SESSION_KEY, uid)
  } catch {
    // storage blocked — session lasts until reload
  }
  notifyAuthChange()
}

export const clearSession = (): void => {
  try {
    sessionStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(SESSION_KEY)
  } catch {
    // ignore
  }
  notifyAuthChange()
}

export const toAuthUser = (user: MockUser): AuthUser => ({
  uid: user.uid,
  email: user.email,
  name: user.name,
  photoURL: user.photoURL ?? null,
  hasPassword: true,
})

export const getCurrentUser = (): AuthUser | null => {
  const uid = readSession()
  const user = uid ? getDb().users.find((u) => u.uid === uid) : undefined
  return user ? toAuthUser(user) : null
}

const listeners = new Set<(user: AuthUser | null) => void>()

export const notifyAuthChange = (): void => {
  const user = getCurrentUser()
  listeners.forEach((listener) => listener(user))
}

export const subscribeAuth = (callback: (user: AuthUser | null) => void): Unsubscribe => {
  listeners.add(callback)
  // Like Firebase: report the current state right after subscribing (asynchronously).
  void Promise.resolve().then(() => {
    if (listeners.has(callback)) callback(getCurrentUser())
  })
  return () => listeners.delete(callback)
}
