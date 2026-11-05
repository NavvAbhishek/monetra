import type { Profile } from '@/types/profile'
import type { ProfileService } from '../contracts'
import { ServiceError } from '../errors'
import { cloneProfile, delay, saveDb } from './db'
import { addUser } from './seed'
import { getDb, notifyAuthChange } from './session'

export const profileMock: ProfileService = {
  async profile_get(uid: string): Promise<Profile | null> {
    await delay()
    const user = getDb().users.find((u) => u.uid === uid)
    return user ? cloneProfile(user) : null
  },

  async profile_create({ uid, name, email, currency }): Promise<Profile> {
    await delay()
    const db = getDb()
    const existing = db.users.find((u) => u.uid === uid)
    if (existing) return cloneProfile(existing)
    const created = addUser(db, { uid, name, email, currency }, { withSampleData: false })
    saveDb()
    return cloneProfile(created)
  },

  async profile_update(uid, patch): Promise<Profile> {
    await delay()
    const user = getDb().users.find((u) => u.uid === uid)
    if (!user) throw new ServiceError('profile/not-found', 'Profile not found.')
    if (patch.name !== undefined) user.name = patch.name.trim()
    if (patch.currency !== undefined) user.currency = patch.currency
    saveDb()
    notifyAuthChange() // the user's name may have changed
    return cloneProfile(user)
  },
}
