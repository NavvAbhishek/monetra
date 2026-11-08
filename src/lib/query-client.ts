import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import API, { isServiceError } from '@/services'
import { useAuthStore } from '@/stores/auth.store'
import { Notification } from '@/utils/notification'

let checkingSession = false

/**
 * A `permission-denied` answer usually means the login stopped being accepted (e.g. the password was reset
 * on another device, which revokes every session). Check that, and if so log out cleanly so the user lands on
 * the login screen instead of a broken page. A real rules problem (session still valid) is left alone.
 */
const endSessionIfRevoked = async (error: unknown) => {
  if (!isServiceError(error) || error.code !== 'permission-denied') return
  if (checkingSession || useAuthStore.getState().status !== 'signedIn') return
  checkingSession = true
  try {
    if (await API.auth.auth_isSessionValid()) return
    Notification.info('Please log in again', 'Your session ended, for example after a password reset.')
    await API.auth.auth_signOut().catch(() => undefined)
    queryClient.clear() // another account must never see this one's cached data
  } finally {
    checkingSession = false
  }
}

export const createQueryClient = () =>
  new QueryClient({
    queryCache: new QueryCache({ onError: endSessionIfRevoked }),
    mutationCache: new MutationCache({ onError: endSessionIfRevoked }),
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // keep Firestore reads low (CLAUDE.md §1.5)
        gcTime: 30 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: { retry: 0 },
    },
  })

export const queryClient = createQueryClient()
