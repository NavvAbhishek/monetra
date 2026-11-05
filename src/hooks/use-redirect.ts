import { useEffect } from 'react'
import { useRouter } from '@/router/navigation'

/**
 * Redirects (replacing history) when `when` becomes true — once per change.
 * Used by the route guards. Do NOT use the <Navigate> component for guards: it re-fires on
 * every render while the router is mid-transition and can loop forever.
 */
export const useRedirect = (when: boolean, to: '/' | '/login') => {
  const router = useRouter() // stable instance (useNavigate changes identity on every navigation)
  useEffect(() => {
    if (when) void router.navigate({ to, replace: true })
  }, [when, to, router])
}
