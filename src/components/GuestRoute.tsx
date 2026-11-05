import type { ReactNode } from 'react'
import PageLoader from '@/components/PageLoader'
import { useRedirect } from '@/hooks/use-redirect'
import { useAuthStore } from '@/stores/auth.store'

/** Login / sign-up pages. Signed-in users are sent to the dashboard. */
const GuestRoute = ({ children }: { children: ReactNode }) => {
  const status = useAuthStore((s) => s.status)
  useRedirect(status === 'signedIn', '/')
  return status === 'signedOut' ? <>{children}</> : <PageLoader fullScreen />
}

export default GuestRoute
