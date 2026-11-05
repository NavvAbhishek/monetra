export type AuthUser = {
  uid: string
  email: string
  name: string
  photoURL?: string | null
}

export type AuthStatus = 'loading' | 'signedIn' | 'signedOut'
