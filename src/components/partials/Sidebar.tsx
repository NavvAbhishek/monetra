import Logo from '@/components/Logo'
import * as Icon from '@/components/icons'
import NavItem from '@/components/partials/NavItem'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { NAV_LINKS, SETTINGS_LINK } from '@/constant/navLinksData'
import { cn } from '@/lib/utils'
import { Link } from '@/router/navigation'
import { useAuthStore } from '@/stores/auth.store'
import { useUIStore } from '@/stores/ui.store'

/**
 * Desktop left navigation (D1–D4). Expanded: 236px with labels. Collapsed: an icon-only strip (the choice is
 * remembered on this device). Hidden below `lg` — phones use the bottom tab bar.
 */
const Sidebar = ({ className }: { className?: string }) => {
  const user = useAuthStore((s) => s.user)
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  return (
    <aside
      data-collapsed={collapsed || undefined}
      className={cn(
        'sticky top-0 h-svh shrink-0 flex-col gap-1.5 bg-card py-6 transition-[width] duration-200',
        collapsed ? 'w-20 px-3' : 'w-59 px-4',
        className,
      )}
    >
      <Link
        to="/"
        aria-label="Go to dashboard"
        className={cn(
          'rounded-control pb-4.5 outline-none focus-visible:ring-2 focus-visible:ring-ring',
          collapsed ? 'mx-auto' : 'px-2',
        )}
      >
        <Logo markOnly={collapsed} />
      </Link>

      {collapsed ? (
        <IconButton asChild variant="primary" size="lg" aria-label="Add expense" title="Add expense" className="mx-auto mb-3.5">
          <Link to="/expenses/new">
            <Icon.Plus aria-hidden />
          </Link>
        </IconButton>
      ) : (
        <Button asChild size="md" fullWidth className="mb-3.5">
          <Link to="/expenses/new">+ Add expense</Link>
        </Button>
      )}

      <nav aria-label="Main" className="flex flex-col gap-1.5">
        {NAV_LINKS.map((link) => (
          <NavItem key={link.to} {...link} collapsed={collapsed} />
        ))}
      </nav>

      {/* bottom: collapse / expand, then the profile → Settings */}
      <div className="mt-auto flex flex-col gap-1.5">
        <Button
          variant="secondary"
          size="md"
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : undefined}
          onClick={toggleSidebar}
          className={cn(collapsed ? 'mx-auto size-11.5 px-0' : 'w-full justify-start gap-3 px-3.5')}
        >
          {collapsed ? <Icon.ChevronsRight aria-hidden /> : <Icon.ChevronsLeft aria-hidden />}
          {!collapsed && <span className="font-semibold">Collapse</span>}
        </Button>

        <Link
          to={SETTINGS_LINK.to}
          aria-label={`Settings for ${user?.name ?? 'your account'}`}
          title={collapsed ? `${user?.name ?? 'Account'} · Settings` : undefined}
          className={cn(
            'flex items-center rounded-control border-t border-muted py-2.5 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
            collapsed ? 'justify-center' : 'gap-2.5 px-2',
          )}
          activeProps={{ className: 'bg-primary-soft' }}
        >
          <Avatar name={user?.name ?? '?'} src={user?.photoURL} />
          {!collapsed && (
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-base font-semibold text-ink">{user?.name ?? 'Account'}</span>
              <span className="text-xs text-muted-foreground">Settings</span>
            </span>
          )}
        </Link>
      </div>
    </aside>
  )
}

export default Sidebar
