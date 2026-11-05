import { Suspense } from 'react'
import MobileTabBar from '@/components/partials/MobileTabBar'
import PageLoader from '@/components/PageLoader'
import ProtectedRoute from '@/components/ProtectedRoute'
import Sidebar from '@/components/partials/Sidebar'
import { cn } from '@/lib/utils'
import { Outlet, useMatches } from '@/router/navigation'
import { isFullScreenMobileRoute } from '@/routes/app.routes'

/**
 * Signed-in shell. Desktop (lg+): sidebar + content. Mobile: content + bottom tab bar,
 * except on the full-screen editor routes (M3, M5) which have their own back button.
 */
const DefaultLayout = () => {
  const routeId = useMatches().at(-1)?.routeId
  const showTabBar = !isFullScreenMobileRoute(routeId)

  return (
    <ProtectedRoute>
      <div className="min-h-svh bg-bg lg:flex">
        <a
          href="#main"
          className="sr-only z-50 rounded-control bg-card px-4 py-2 font-semibold text-primary-hover shadow-panel focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <Sidebar className="hidden lg:flex" />
        <main id="main" tabIndex={-1} className={cn('outline-none', 'min-w-0 flex-1 px-5.5 pt-4 lg:px-9 lg:py-7', showTabBar ? 'pb-28' : 'pb-8', 'lg:pb-7')}>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
        {showTabBar && <MobileTabBar className="lg:hidden" />}
      </div>
    </ProtectedRoute>
  )
}

export default DefaultLayout
