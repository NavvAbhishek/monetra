import { createRootRoute, createRoute, lazyRouteComponent } from '@tanstack/react-router'
import AppRouteError from '@/components/AppRouteError'
import AuthLayout from '@/layouts/AuthLayout'
import DefaultLayout from '@/layouts/DefaultLayout'
import RootLayout from '@/layouts/RootLayout'
import NotFound from '@/pages/not-found'

// ---------------------------- Root --------------------------

const rootRoute = createRootRoute({
  component: RootLayout,
  errorComponent: AppRouteError,
  notFoundComponent: NotFound,
})

// ---------------------------- Auth (guest) layout --------------------------
// GuestRoute guard is added in Phase 4.

const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: '_auth',
  component: AuthLayout,
})

const loginRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/login',
  component: lazyRouteComponent(() => import('@/pages/auth/login')),
})

const signupRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/signup',
  component: lazyRouteComponent(() => import('@/pages/auth/signup')),
})

const forgotPasswordRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/forgot-password',
  component: lazyRouteComponent(() => import('@/pages/auth/forgot-password')),
})

// ---------------------------- App (signed-in) layout --------------------------
// ProtectedRoute guard is added in Phase 4.

const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: '_app',
  component: DefaultLayout,
})

const dashboardRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/',
  component: lazyRouteComponent(() => import('@/pages/dashboard')),
})

const expensesRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/expenses',
  component: lazyRouteComponent(() => import('@/pages/expenses')),
})

const expenseNewRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/expenses/new',
  component: lazyRouteComponent(() => import('@/pages/expenses/pages/ExpenseEditor')),
})

const expenseEditRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/expenses/$expenseId',
  component: lazyRouteComponent(() => import('@/pages/expenses/pages/ExpenseEditor')),
})

const categoriesRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/categories',
  component: lazyRouteComponent(() => import('@/pages/categories')),
})

const categoryNewRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/categories/new',
  component: lazyRouteComponent(() => import('@/pages/categories/pages/CategoryEditor')),
})

const categoryEditRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/categories/$categoryId',
  component: lazyRouteComponent(() => import('@/pages/categories/pages/CategoryEditor')),
})

const settingsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/settings',
  component: lazyRouteComponent(() => import('@/pages/settings')),
})

// ---------------------------- Dev only --------------------------

// Created only in `npm run dev`, so the style guide is not shipped in production builds.
const devRoutes = import.meta.env.DEV
  ? [
      createRoute({
        getParentRoute: () => rootRoute,
        path: '/dev/ui',
        component: lazyRouteComponent(() => import('@/pages/dev-ui')),
      }),
    ]
  : []

// ---------------------------- Tree --------------------------

export const routeTree = rootRoute.addChildren([
  authLayoutRoute.addChildren([loginRoute, signupRoute, forgotPasswordRoute]),
  appLayoutRoute.addChildren([
    dashboardRoute,
    expensesRoute,
    expenseNewRoute,
    expenseEditRoute,
    categoriesRoute,
    categoryNewRoute,
    categoryEditRoute,
    settingsRoute,
  ]),
  ...devRoutes,
])
