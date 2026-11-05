import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { getFirebaseAuth } from '@/lib/firebase'
import { DEFAULT_CURRENCY } from '@/utils/money'
import type { AuthService } from '../contracts'
import { listeners, runAccountSetup, toAuthUser, waitForAccountSetup } from './auth-listeners'
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
      await sendPasswordResetEmail(getFirebaseAuth(), email.trim())
    } catch (error) {
      if (error instanceof FirebaseError && error.code === 'auth/user-not-found') return
      throw error
    }
  }),

  auth_signOut: guard(() => signOut(getFirebaseAuth())),

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
