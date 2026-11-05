import type { ReactNode } from 'react'
import PageLoader from '@/components/PageLoader'
import { useRedirect } from '@/hooks/use-redirect'
import { useAuthStore } from '@/stores/auth.store'

/** Signed-in pages only. Signed-out visitors are sent to /login. */
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const status = useAuthStore((s) => s.status)
  useRedirect(status === 'signedOut', '/login')
  return status === 'signedIn' ? <>{children}</> : <PageLoader fullScreen />
}

export default ProtectedRoute
