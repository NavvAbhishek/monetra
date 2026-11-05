import { lazy, Suspense, useEffect } from 'react'
import PageLoader from '@/components/PageLoader'
import { SHOW_DEVTOOLS } from '@/lib/env'
import { Outlet, useMatches } from '@/router/navigation'
import { getDocumentTitle } from '@/routes/app.routes'

const RouterDevtools = SHOW_DEVTOOLS
  ? lazy(() =>
      import('@tanstack/react-router-devtools').then((m) => ({
        default: m.TanStackRouterDevtools,
      })),
    )
  : () => null

const RootLayout = () => {
  const matches = useMatches()
  const routeId = matches.at(-1)?.routeId

  const title = getDocumentTitle(routeId)
  useEffect(() => {
    document.title = title
  }, [title])

  return (
    <>
      {/* Single-page apps don't announce navigation — tell screen readers which page opened. */}
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {title}
      </p>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
      <Suspense>
        <RouterDevtools position="bottom-right" />
      </Suspense>
    </>
  )
}

export default RootLayout
