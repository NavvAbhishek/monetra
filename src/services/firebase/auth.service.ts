import {
  browserLocalPersistence,
  browserSessionPersistence,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile,
  verifyPasswordResetCode,
  type User,
} from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { getFirebaseAuth } from '@/lib/firebase'
import { DEFAULT_CURRENCY } from '@/utils/money'
import type { AuthService } from '../contracts'
import { listeners, runAccountSetup, toAuthUser, waitForAccountSetup } from './auth-listeners'
import { ServiceError } from '../errors'
import { guard } from './errors'
import { profileFirebase } from './profile.service'

/** Makes sure the profile + default categories exist (first login with Google, or a sign-up that failed half-way). */
const ensureProfile = async (user: User, currency = DEFAULT_CURRENCY) => {
  const existing = await profileFirebase.profile_get(user.uid)
  if (!existing) {
    await profileFirebase.profile_create({
      uid: user.uid,
      name: user.displayName || user.email?.split('@')[0] || 'Friend',
      email: user.email ?? '',
      currency,
    })
  }
}

/** Token-refresh errors that mean the login is gone for good (not a flaky connection). */
const DEAD_SESSION_CODES = new Set([
  'auth/user-token-expired',
  'auth/invalid-user-token',
  'auth/user-disabled',
  'auth/user-not-found',
  'auth/id-token-revoked',
])

export const authFirebase: AuthService = {
  auth_signIn: guard(({ email, password, keepLoggedIn }) =>
    runAccountSetup(async () => {
      const auth = getFirebaseAuth()
      // "Keep me logged in" (CLAUDE.md §7.3): survive closing the browser, or only this tab.
      await setPersistence(auth, keepLoggedIn ? browserLocalPersistence : browserSessionPersistence)
      const { user } = await signInWithEmailAndPassword(auth, email.trim(), password)
      await ensureProfile(user)
      return toAuthUser(user)
    }),
  ),

  auth_signUp: guard(({ name, email, password, currency }) =>
    runAccountSetup(async () => {
      const auth = getFirebaseAuth()
      await setPersistence(auth, browserLocalPersistence)
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password)
      await updateProfile(user, { displayName: name.trim() })
      await profileFirebase.profile_create({ uid: user.uid, name: name.trim(), email: user.email ?? email.trim(), currency })
      return toAuthUser(user)
    }),
  ),

  auth_google: guard(() =>
    runAccountSetup(async () => {
      const auth = getFirebaseAuth()
      await setPersistence(auth, browserLocalPersistence)
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      const { user } = await signInWithPopup(auth, provider)
      await ensureProfile(user)
      return toAuthUser(user)
    }),
  ),

  /** Never reveals whether an account exists for the email. */
  auth_resetPassword: guard(async (email) => {
    try {
      // `url` = where the "Continue" link after a successful reset points (this site's login page)
      await sendPasswordResetEmail(getFirebaseAuth(), email.trim(), { url: `${window.location.origin}/login` })
    } catch (error) {
      if (error instanceof FirebaseError && error.code === 'auth/user-not-found') return
      throw error
    }
  }),

  /** The reset link opens /reset-password?oobCode=… (set in Firebase console → Authentication → Templates → Password reset). */
  auth_verifyResetCode: guard((code) => verifyPasswordResetCode(getFirebaseAuth(), code)),

  auth_confirmPasswordReset: guard((code, newPassword) => confirmPasswordReset(getFirebaseAuth(), code, newPassword)),

  auth_changePassword: guard(async (currentPassword, newPassword) => {
    const user = getFirebaseAuth().currentUser
    if (!user?.email) throw new ServiceError('auth/not-signed-in', 'Please log in again.')
    try {
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, currentPassword))
    } catch (error) {
      // wrong current password → a message that fits "Change password" (not "Incorrect email or password")
      if (error instanceof FirebaseError && ['auth/invalid-credential', 'auth/wrong-password', 'auth/invalid-login-credentials'].includes(error.code)) {
        throw new ServiceError('auth/wrong-password', 'Your current password is incorrect.')
      }
      throw error
    }
    await updatePassword(user, newPassword)
  }),

  auth_signOut: guard(() => signOut(getFirebaseAuth())),

  auth_isSessionValid: async () => {
    const user = getFirebaseAuth().currentUser
    if (!user) return false
    try {
      await user.getIdToken(true) // forces a refresh: fails for good when the refresh token was revoked
      return true
    } catch (error) {
      const code = error instanceof FirebaseError ? error.code : ''
      return !DEAD_SESSION_CODES.has(code)
    }
  },

  auth_onChange: (callback) => {
    listeners.add(callback)
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (user) => {
      await waitForAccountSetup() // don't open the app before the new account's data exists
      callback(user ? toAuthUser(user) : null)
    })
    return () => {
      listeners.delete(callback)
      unsubscribe()
    }
  },
}
