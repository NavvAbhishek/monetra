import { useSyncExternalStore } from 'react'

/** Below this width the mobile layout is used (Tailwind `lg`, CLAUDE.md §4). */
const MOBILE_QUERY = '(max-width: 1023px)'

const subscribe = (onChange: () => void) => {
  const mql = window.matchMedia(MOBILE_QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

/** True on phones / small windows. Use it when mobile and desktop render DIFFERENT markup. */
export const useIsMobile = (): boolean =>
  useSyncExternalStore(subscribe, () => window.matchMedia(MOBILE_QUERY).matches, () => false)
