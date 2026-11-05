import type { Backend } from './contracts'
import { firebaseBackend } from './firebase'
import { mockBackend } from './mock'

/**
 * The one backend the app talks to. Pick it with VITE_DATA_SOURCE in .env.local:
 *   firebase — the real backend (Firebase Auth + Firestore)
 *   mock     — in-browser fake backend with sample data (offline demo, UI work)
 * Both implement the same contract (contracts.ts), so nothing else changes.
 *
 * Usage: `API.expenses.expense_create(uid, input)`
 */
const source = import.meta.env.VITE_DATA_SOURCE ?? 'mock'

const API: Backend = source === 'firebase' ? firebaseBackend : mockBackend

export default API
export { ServiceError, isServiceError } from './errors'
export type { Backend } from './contracts'
