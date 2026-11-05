import { useAuthStore } from '@/stores/auth.store'
import { ServiceError } from '@/services'

/** The signed-in user's id, or throws. Used by mutations (queries use `enabled: !!uid`). */
export const requireUid = (): string => {
  const uid = useAuthStore.getState().user?.uid
  if (!uid) throw new ServiceError('auth/not-signed-in', 'Please log in again.')
  return uid
}

/** Reactive uid for query hooks. */
export const useUid = (): string | undefined => useAuthStore((s) => s.user?.uid)

/** Message for toasts: service errors are already written for users. */
export const errorMessage = (error: unknown, fallback = 'Something went wrong. Please try again.'): string =>
  error instanceof Error && error.message ? error.message : fallback
