import { Suspense } from 'react'
import PageLoader from '@/components/PageLoader'
import { Link, Outlet } from '@/router/navigation'

// Temporary shell — the real Sidebar / TopBar / MobileTabBar are built in Phase 4.
const TEMP_LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/expenses', label: 'Expenses' },
  { to: '/expenses/new', label: 'Add expense' },
  { to: '/categories', label: 'Categories' },
  { to: '/categories/new', label: 'New category' },
  { to: '/settings', label: 'Settings' },
  { to: '/login', label: 'Log in' },
] as const

const DefaultLayout = () => (
  <div className="min-h-svh bg-bg">
    <nav className="flex flex-wrap gap-1 border-b border-line bg-card px-4 py-3">
      {TEMP_LINKS.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          activeOptions={{ exact: true }}
          className="rounded-control px-3 py-1.5 text-sm font-semibold"
          activeProps={{ className: 'bg-primary-soft text-primary' }}
          inactiveProps={{ className: 'text-muted-foreground hover:bg-muted' }}
        >
          {link.label}
        </Link>
      ))}
    </nav>
    <main className="mx-auto w-full max-w-5xl p-4 lg:p-8">
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </main>
  </div>
)

export default DefaultLayout
