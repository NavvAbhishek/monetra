import type { Backend } from './contracts'
import { mockBackend } from './mock'

/**
 * The one backend the app talks to. Pick it with VITE_DATA_SOURCE in .env.local:
 *   mock      (default) — in-browser fake backend, no Firebase needed
 *   firebase  — real backend, added in Phase 12
 *
 * Usage: `API.expenses.expense_create(uid, input)`
 */
const source = import.meta.env.VITE_DATA_SOURCE ?? 'mock'

if (source === 'firebase') {
  throw new Error('VITE_DATA_SOURCE=firebase is not available yet — the Firebase backend is built in Phase 12.')
}

const API: Backend = mockBackend

export default API
export { ServiceError, isServiceError } from './errors'
export type { Backend } from './contracts'
