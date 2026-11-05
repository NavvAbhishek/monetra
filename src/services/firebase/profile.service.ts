import { updateProfile } from 'firebase/auth'
import { getDoc, Timestamp, updateDoc, doc, writeBatch } from 'firebase/firestore'
import { DEFAULT_CATEGORIES } from '@/constant/defaultCategories'
import { getDb, getFirebaseAuth } from '@/lib/firebase'
import type { Profile } from '@/types/profile'
import type { ProfileService } from '../contracts'
import { ServiceError } from '../errors'
import { notifyAuthUserChanged } from './auth-listeners'
import { profileFromDoc } from './converters'
import { guard } from './errors'
import { categoriesCol, profileRef } from './paths'

export const profileFirebase: ProfileService = {
  profile_get: guard(async (uid) => {
    const snap = await getDoc(profileRef(uid))
    return snap.exists() ? profileFromDoc(snap) : null
  }),

  /** Profile + the 6 default categories in ONE batch (all or nothing). Safe to call twice. */
  profile_create: guard(async ({ uid, name, email, currency }) => {
    const existing = await getDoc(profileRef(uid))
    if (existing.exists()) return profileFromDoc(existing)

    const now = Timestamp.now()
    const batch = writeBatch(getDb())
    batch.set(profileRef(uid), { name: name.trim(), email, currency, createdAt: now })
    DEFAULT_CATEGORIES.forEach((c, i) => {
      batch.set(doc(categoriesCol(uid)), { name: c.name, emoji: c.emoji, colourIndex: c.colourIndex, order: i, createdAt: now })
    })
    await batch.commit()
    return { uid, name: name.trim(), email, currency, createdAt: now.toDate() } satisfies Profile
  }),

  profile_update: guard(async (uid, patch) => {
    const changes: Record<string, string> = {}
    if (patch.name !== undefined) changes.name = patch.name.trim()
    if (patch.currency !== undefined) changes.currency = patch.currency
    const snap = await getDoc(profileRef(uid))
    if (!snap.exists()) throw new ServiceError('profile/not-found', 'Profile not found.')
    await updateDoc(profileRef(uid), changes)

    const user = getFirebaseAuth().currentUser
    if (changes.name && user?.uid === uid) {
      await updateProfile(user, { displayName: changes.name })
      notifyAuthUserChanged()
    }
    return profileFromDoc(await getDoc(profileRef(uid)))
  }),
}
