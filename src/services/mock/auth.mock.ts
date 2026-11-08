import { MIN_PASSWORD_LENGTH } from '@/schemas/shared'
import type { AuthUser } from '@/types/auth'
import type { AuthService, SignInInput, SignUpInput } from '../contracts'
import { ServiceError } from '../errors'
import { delay, newId, saveDb } from './db'
import { addUser, DEMO_EMAIL } from './seed'
import { clearSession, getCurrentUser, getDb, setSession, subscribeAuth, toAuthUser } from './session'

const normaliseEmail = (email: string) => email.trim().toLowerCase()

const nameFromEmail = (email: string) => {
  const local = email.split('@')[0] ?? ''
  const words = local.split(/[._-]+/).filter(Boolean)
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Friend'
}

const requireStrongPassword = (password: string) => {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new ServiceError('auth/invalid-credentials', `Use at least ${MIN_PASSWORD_LENGTH} characters.`)
  }
}

const requireValidPassword = (password: string) => {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new ServiceError('auth/invalid-credentials', 'Incorrect email or password.')
  }
}

export const authMock: AuthService = {
  /**
   * Mock rule: any email + a password of 8+ characters signs in. An email that has no
   * account yet gets one, with the sample data, so there is always something to look at.
   */
  async auth_signIn({ email, password, keepLoggedIn }: SignInInput): Promise<AuthUser> {
    await delay()
    requireValidPassword(password)
    const db = getDb()
    const address = normaliseEmail(email)
    let user = db.users.find((u) => u.email === address)
    if (!user) {
      user = addUser(
        db,
        { uid: newId(), name: nameFromEmail(address), email: address, currency: 'USD' },
        { withSampleData: true },
      )
      saveDb()
    }
    setSession(user.uid, keepLoggedIn)
    return toAuthUser(user)
  },

  /** New accounts start with the default categories and no expenses (like Firebase will). */
  async auth_signUp({ name, email, password, currency }: SignUpInput): Promise<AuthUser> {
    await delay()
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new ServiceError('auth/invalid-credentials', `Use at least ${MIN_PASSWORD_LENGTH} characters.`)
    }
    const db = getDb()
    const address = normaliseEmail(email)
    if (db.users.some((u) => u.email === address)) {
      throw new ServiceError('auth/email-in-use', 'An account with this email already exists.')
    }
    const user = addUser(
      db,
      { uid: newId(), name: name.trim(), email: address, currency },
      { withSampleData: false },
    )
    saveDb()
    setSession(user.uid, true)
    return toAuthUser(user)
  },

  /** Mock Google sign-in: always the demo account (Sam). */
  async auth_google(): Promise<AuthUser> {
    await delay()
    const db = getDb()
    const user = db.users.find((u) => u.email === DEMO_EMAIL)
    if (!user) throw new ServiceError('auth/invalid-credentials', 'Google sign-in is unavailable.')
    setSession(user.uid, true)
    return toAuthUser(user)
  },

  async auth_resetPassword(): Promise<void> {
    await delay() // always "succeeds" — never reveals whether the email has an account
  },

  /** Demo: any code works and belongs to the demo account, except the code "expired". */
  async auth_verifyResetCode(code: string): Promise<string> {
    await delay()
    if (!code || code === 'expired') {
      throw new ServiceError('auth/invalid-link', 'This link has expired or was already used. Request a new one.')
    }
    return DEMO_EMAIL
  },

  async auth_confirmPasswordReset(code: string, newPassword: string): Promise<void> {
    await delay()
    if (!code || code === 'expired') {
      throw new ServiceError('auth/invalid-link', 'This link has expired or was already used. Request a new one.')
    }
    requireStrongPassword(newPassword)
  },

  /** Demo: the mock keeps no passwords, so any current password of 8+ characters is accepted. */
  async auth_changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await delay()
    if (currentPassword.length < MIN_PASSWORD_LENGTH) {
      throw new ServiceError('auth/wrong-password', 'Your current password is incorrect.')
    }
    requireStrongPassword(newPassword)
  },

  async auth_signOut(): Promise<void> {
    await delay(0)
    clearSession()
  },

  async auth_isSessionValid(): Promise<boolean> {
    return getCurrentUser() !== null
  },

  auth_onChange: subscribeAuth,
}

export { getCurrentUser }
