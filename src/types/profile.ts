export type Profile = {
  uid: string
  name: string
  email: string
  /** ISO 4217 code, e.g. "USD". */
  currency: string
  createdAt: Date
}

export type ProfilePatch = Partial<Pick<Profile, 'name' | 'currency'>>
