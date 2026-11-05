/**
 * Route metadata: path pattern → page title (CLAUDE.md §4).
 * Paths use TanStack Router syntax (`$param`).
 */
export type AppRouteMeta = {
  path: string
  label: string
  parent?: string
}

export const APP_ROUTES: AppRouteMeta[] = [
  // Auth
  { path: '/login', label: 'Log in' },
  { path: '/signup', label: 'Create account' },
  { path: '/forgot-password', label: 'Reset password' },
  // App
  { path: '/', label: 'Dashboard' },
  { path: '/expenses', label: 'Expenses' },
  { path: '/expenses/new', label: 'Add expense', parent: '/expenses' },
  { path: '/expenses/$expenseId', label: 'Edit expense', parent: '/expenses' },
  { path: '/categories', label: 'Categories' },
  { path: '/categories/new', label: 'New category', parent: '/categories' },
  { path: '/categories/$categoryId', label: 'Edit category', parent: '/categories' },
  { path: '/settings', label: 'Settings' },
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
