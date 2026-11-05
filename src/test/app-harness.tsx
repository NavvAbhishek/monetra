import { QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { useAuthListener } from '@/hooks/use-auth-listener'
import { createQueryClient } from '@/lib/query-client'
import { createAppRouter } from '@/router'
import API from '@/services'
import { resetDb } from '@/services/mock/db'
import { useAuthStore } from '@/stores/auth.store'
import { useUIStore } from '@/stores/ui.store'

/**
 * Renders the real app (router + auth listener + toasts) on the real mock backend,
 * like App.tsx does. Use for page-level tests.
 */
// eslint-disable-next-line react/only-export-components -- test helper, never hot-reloaded
const Harness = ({ router }: { router: ReturnType<typeof createAppRouter> }) => {
  useAuthListener()
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  )
}

export const DEMO_EMAIL = 'sam@email.com'
export const PASSWORD = 'password1'

/** Signs in (unless `email` is null) and renders the app at `path`. */
export const renderApp = async (path: string, { email = DEMO_EMAIL as string | null } = {}) => {
  if (email) await API.auth.auth_signIn({ email, password: PASSWORD, keepLoggedIn: true })
  const router = createAppRouter(createMemoryHistory({ initialEntries: [path] }))
  const queryClient = createQueryClient()
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <Harness router={router} />
    </QueryClientProvider>,
  )
  return { router, queryClient, ...utils }
}

const originalMatchMedia = window.matchMedia
/** Switch the app to the mobile layout (useIsMobile reads matchMedia). */
export const setMobile = (mobile: boolean) => {
  window.matchMedia = ((query: string) => ({ ...originalMatchMedia(query), matches: mobile })) as typeof window.matchMedia
}

/** Fresh mock db, logged-out store, default UI prefs and desktop layout. Call in beforeEach. */
export const resetApp = () => {
  toast.dismiss()
  resetDb()
  window.matchMedia = originalMatchMedia
  localStorage.removeItem('monetra-ui')
  useUIStore.setState({ period: 'week', customRange: null, lastCategoryId: null, themeColor: 'violet' })
  useAuthStore.setState({ user: null, status: 'loading' })
}

export const h1 = (name: string | RegExp) => screen.findByRole('heading', { level: 1, name })
