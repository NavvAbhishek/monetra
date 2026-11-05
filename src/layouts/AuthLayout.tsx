import { Suspense } from 'react'
import * as Icon from '@/components/icons'
import AuthShowcase, { type AuthShowcaseVariant } from '@/components/partials/AuthShowcase'
import EmojiCollage from '@/components/partials/EmojiCollage'
import GuestRoute from '@/components/GuestRoute'
import PageLoader from '@/components/PageLoader'
import { IconButton } from '@/components/ui/icon-button'
import { cn } from '@/lib/utils'
import { Link, Outlet, useLocation } from '@/router/navigation'

type AuthScreen = {
  /** Left panel on desktop. */
  showcase: AuthShowcaseVariant
  /** Mobile: purple header with tiles (login) instead of a back button. */
  mobileHero: boolean
}

const SCREENS: Record<string, AuthScreen> = {
  '/login': { showcase: 'tiles', mobileHero: true },
  '/signup': { showcase: 'summary', mobileHero: false },
  '/forgot-password': { showcase: 'tiles', mobileHero: false },
}

/**
 * Logged-out shell. Desktop (D5/D6): purple showcase panel + centred form.
 * Mobile: login has the purple tile header (M7); other screens a back button (M8).
 * The page (form) is rendered once by <Outlet/> and works at every size.
 */
const AuthLayout = () => {
  const { pathname } = useLocation()
  const screen = SCREENS[pathname] ?? SCREENS['/login']

  return (
    <GuestRoute>
      <div className="min-h-svh lg:flex">
        <AuthShowcase variant={screen.showcase} className="hidden lg:flex" />

        <div className={cn('flex min-h-svh min-w-0 flex-1 flex-col', screen.mobileHero ? 'bg-primary lg:bg-bg' : 'bg-bg')}>
          {screen.mobileHero ? (
            <EmojiCollage size="compact" className="h-57.5 shrink-0 lg:hidden" />
          ) : (
            <div className="px-4.5 pt-3 lg:hidden">
              <IconButton asChild variant="surface" size="lg" aria-label="Back to log in">
                <Link to="/login">
                  <Icon.ArrowLeft aria-hidden />
                </Link>
              </IconButton>
            </div>
          )}

          <main
            className={cn(
              'flex-1 px-6 pb-8 lg:grid lg:place-items-center lg:p-8',
              screen.mobileHero ? 'rounded-t-sheet bg-bg pt-7 lg:rounded-none lg:pt-8' : 'pt-4 lg:pt-8',
            )}
          >
            <div className="mx-auto w-full max-w-105">
              <Suspense fallback={<PageLoader />}>
                <Outlet />
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </GuestRoute>
  )
}

export default AuthLayout
