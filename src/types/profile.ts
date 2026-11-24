/** One spending target that repeats every week or every month until it is changed (user request 2026-11-22). */
export type SpendTarget = {
  period: 'week' | 'month'
  /** Integer cents, > 0. */
  cents: number
}

export type Profile = {
  uid: string
  name: string
  email: string
  /** ISO 4217 code, e.g. "USD". */
  currency: string
  /** Optional spending target. */
  target?: SpendTarget
  createdAt: Date
}

/** `target: null` removes the target. */
export type ProfilePatch = Partial<Pick<Profile, 'name' | 'currency'>> & { target?: SpendTarget | null }
