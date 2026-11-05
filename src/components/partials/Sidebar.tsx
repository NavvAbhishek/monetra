import Logo from '@/components/Logo'
import NavItem from '@/components/partials/NavItem'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { NAV_LINKS, SETTINGS_LINK } from '@/constant/navLinksData'
import { cn } from '@/lib/utils'
import { Link } from '@/router/navigation'
import { useAuthStore } from '@/stores/auth.store'

/** Desktop left navigation (236px) — logo, "+ Add expense", links, user (D1–D4). */
const Sidebar = ({ className }: { className?: string }) => {
  const user = useAuthStore((s) => s.user)

  return (
    <aside className={cn('sticky top-0 h-svh w-59 shrink-0 flex-col gap-1.5 bg-card px-4 py-6', className)}>
      <Link to="/" aria-label="Go to dashboard" className="px-2 pb-4.5 outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Logo />
      </Link>

      <Button asChild size="md" fullWidth className="mb-3.5">
        <Link to="/expenses/new">+ Add expense</Link>
      </Button>

      <nav aria-label="Main" className="flex flex-col gap-1.5">
        {NAV_LINKS.map((link) => (
          <NavItem key={link.to} {...link} />
        ))}
      </nav>

      <Link
        to={SETTINGS_LINK.to}
        aria-label={`Settings for ${user?.name ?? 'your account'}`}
        className="mt-auto flex items-center gap-2.5 rounded-control border-t border-muted px-2 py-2.5 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        activeProps={{ className: 'bg-primary-soft' }}
      >
        <Avatar name={user?.name ?? '?'} src={user?.photoURL} />
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-base font-semibold text-ink">{user?.name ?? 'Account'}</span>
          <span className="text-xs text-muted-foreground">Settings</span>
        </span>
      </Link>
    </aside>
  )
}

export default Sidebar
