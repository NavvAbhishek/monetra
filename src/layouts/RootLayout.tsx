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

  useEffect(() => {
    document.title = getDocumentTitle(routeId)
  }, [routeId])

  return (
    <>
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
