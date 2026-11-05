import type { Category } from '@/types/category'
import type { Expense } from '@/types/expense'
import type { Profile } from '@/types/profile'
import { newId } from '@/utils/id'

/**
 * The mock "database": plain JSON in localStorage so data survives a page refresh.
 * Dates are written as ISO strings and revived on load (any key ending in "At").
 */

const STORAGE_KEY = 'monetra-mock-db'
const DB_VERSION = 1

export type MockUser = Profile & { photoURL?: string | null }

export type MockDb = {
  version: typeof DB_VERSION
  users: MockUser[]
  /** keyed by uid */
  categories: Record<string, Category[]>
  /** keyed by uid */
  expenses: Record<string, Expense[]>
}

/** Fake network delay so loading states are visible while building the UI. 0 in tests. */
export const MOCK_DELAY_MS = import.meta.env.MODE === 'test' ? 0 : 250

export const delay = (ms: number = MOCK_DELAY_MS): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

const reviveDates = (key: string, value: unknown) =>
  typeof value === 'string' && key.endsWith('At') ? new Date(value) : value

let cache: MockDb | null = null

const emptyDb = (): MockDb => ({ version: DB_VERSION, users: [], categories: {}, expenses: {} })

const storage = (): Storage | null => {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null // storage blocked (private mode)
  }
}

/** Loads (once) from localStorage. Starts empty — `getDb` in seed.ts adds the demo account. */
export const loadDb = (): MockDb => {
  if (cache) return cache
  const raw = storage()?.getItem(STORAGE_KEY)
  if (raw) {
    try {
      const parsed = JSON.parse(raw, reviveDates) as MockDb
      if (parsed.version === DB_VERSION) {
        cache = parsed
        return cache
      }
    } catch {
      // corrupted — start fresh below
    }
  }
  cache = emptyDb()
  return cache
}

export const saveDb = (): void => {
  if (!cache) return
  try {
    storage()?.setItem(STORAGE_KEY, JSON.stringify(cache))
  } catch {
    // storage full / blocked — the in-memory copy still works for this session
  }
}

/** Wipes the mock data and the session (Settings → "Reset mock data", tests). */
export const resetDb = (): void => {
  cache = null
  try {
    storage()?.removeItem(STORAGE_KEY)
    storage()?.removeItem('monetra-mock-session')
    sessionStorage.removeItem('monetra-mock-session')
  } catch {
    // ignore
  }
}

export { newId }

export const cloneExpense = (e: Expense): Expense => ({
  ...e,
  spentAt: new Date(e.spentAt),
  createdAt: new Date(e.createdAt),
  updatedAt: new Date(e.updatedAt),
})

export const cloneCategory = (c: Category): Category => ({ ...c, createdAt: new Date(c.createdAt) })

export const cloneProfile = (u: MockUser): Profile => ({
  uid: u.uid,
  name: u.name,
  email: u.email,
  currency: u.currency,
  createdAt: new Date(u.createdAt),
})
