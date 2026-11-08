/**
 * Route metadata: path pattern → page title (CLAUDE.md §4).
 * Paths use TanStack Router syntax (`$param`).
 */
export type AppRouteMeta = {
  path: string
  label: string
  parent?: string
  /** Full-screen editor on mobile (M3, M5): no bottom tab bar, the page has its own back button. */
  fullScreenOnMobile?: boolean
}

export const APP_ROUTES: AppRouteMeta[] = [
  // Auth
  { path: '/login', label: 'Log in' },
  { path: '/signup', label: 'Create account' },
  { path: '/forgot-password', label: 'Reset password' },
  { path: '/reset-password', label: 'Choose a new password' },
  // App
  { path: '/', label: 'Dashboard' },
  { path: '/expenses', label: 'Expenses' },
  { path: '/expenses/new', label: 'Add expense', parent: '/expenses', fullScreenOnMobile: true },
  { path: '/expenses/$expenseId', label: 'Edit expense', parent: '/expenses', fullScreenOnMobile: true },
  { path: '/categories', label: 'Categories' },
  { path: '/categories/new', label: 'New category', parent: '/categories', fullScreenOnMobile: true },
  { path: '/categories/$categoryId', label: 'Edit category', parent: '/categories', fullScreenOnMobile: true },
  { path: '/settings', label: 'Settings' },
  { path: '/past-spending', label: 'Past spending' },
  // Dev only
  { path: '/dev/ui', label: 'UI style guide' },
]

export const APP_NAME = 'Monetra'

/**
 * Converts a TanStack route id to its path pattern by removing pathless layout ids.
 * '/_app/expenses/$expenseId' → '/expenses/$expenseId', '/_app/' → '/'.
 */
export const routeIdToPath = (routeId: string): string => {
  const path = routeId.replace(/\/_(app|auth)(?=\/|$)/g, '')
  if (path === '' || path === '/') return '/'
  return path.endsWith('/') ? path.slice(0, -1) : path
}

export const getRouteLabel = (path: string): string | undefined =>
  APP_ROUTES.find((r) => r.path === path)?.label

/** Browser tab title, e.g. "Expenses · Monetra". */
export const getDocumentTitle = (routeId: string | undefined): string => {
  const label = routeId ? getRouteLabel(routeIdToPath(routeId)) : undefined
  return label ? `${label} · ${APP_NAME}` : APP_NAME
}

/** Should the mobile bottom tab bar be hidden on this route? */
export const isFullScreenMobileRoute = (routeId: string | undefined): boolean =>
  !!routeId && !!APP_ROUTES.find((r) => r.path === routeIdToPath(routeId))?.fullScreenOnMobile
