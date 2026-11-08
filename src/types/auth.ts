export type AuthUser = {
  uid: string
  email: string
  name: string
  photoURL?: string | null
  /** Has an email + password login (false for Google-only accounts → nothing to "change"). */
  hasPassword?: boolean
}

export type AuthStatus = 'loading' | 'signedIn' | 'signedOut'
