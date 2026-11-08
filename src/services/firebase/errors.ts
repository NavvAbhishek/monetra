import { FirebaseError } from 'firebase/app'
import { isServiceError, ServiceError } from '../errors'

/** Firebase error → ServiceError with a message written for the user. */
export const toServiceError = (error: unknown): ServiceError => {
  if (isServiceError(error)) return error
  const code = error instanceof FirebaseError ? error.code : ''

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return new ServiceError('auth/invalid-credentials', 'Incorrect email or password.')
    case 'auth/expired-action-code':
    case 'auth/invalid-action-code':
      return new ServiceError('auth/invalid-link', 'This link has expired or was already used. Request a new one.')
    case 'auth/email-already-in-use':
      return new ServiceError('auth/email-in-use', 'An account with this email already exists.')
    case 'auth/weak-password':
      return new ServiceError('auth/invalid-credentials', 'Choose a stronger password (at least 8 characters).')
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
    case 'auth/user-cancelled':
      return new ServiceError('auth/cancelled', 'Sign-in was cancelled.')
    case 'auth/popup-blocked':
      return new ServiceError('auth/cancelled', 'Your browser blocked the sign-in window. Allow pop-ups and try again.')
    case 'auth/account-exists-with-different-credential':
      return new ServiceError('auth/email-in-use', 'This email already has an account. Log in with your password.')
    case 'auth/operation-not-allowed':
      return new ServiceError('auth/not-enabled', 'This sign-in method isn’t enabled yet.')
    case 'auth/too-many-requests':
      return new ServiceError('auth/too-many-requests', 'Too many attempts. Wait a minute and try again.')
    case 'auth/network-request-failed':
    case 'unavailable':
      return new ServiceError('network', 'You’re offline. Check your connection and try again.')
    case 'permission-denied':
      return new ServiceError('permission-denied', 'You don’t have access to this data. Please log in again.')
    case 'not-found':
      return new ServiceError('expense/not-found', 'That item no longer exists.')
    default:
      return new ServiceError('unknown', 'Something went wrong. Please try again.')
  }
}

/** Wraps a service function so every failure is a ServiceError. */
export const guard =
  <A extends unknown[], R>(fn: (...args: A) => Promise<R>) =>
  async (...args: A): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      if (import.meta.env.DEV && !isServiceError(error)) console.error('[firebase]', error)
      throw toServiceError(error)
    }
  }
