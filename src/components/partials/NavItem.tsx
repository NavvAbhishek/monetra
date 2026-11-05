import type { ComponentType, SVGProps } from 'react'
import { Link } from '@/router/navigation'
import { cn } from '@/lib/utils'
import type { NAV_LINKS } from '@/constant/navLinksData'

type NavTo = (typeof NAV_LINKS)[number]['to'] | '/settings'

export type NavItemProps = {
  to: NavTo
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

/** Desktop sidebar link. Active state = soft purple pill (D2). `aria-current` is set by the router. */
const NavItem = ({ to, label, icon: Icon }: NavItemProps) => (
  <Link
    to={to}
    // "/" must match exactly; the others also stay active on sub-routes like /expenses/new
    activeOptions={{ exact: to === '/' }}
    className="flex h-11 items-center gap-3 rounded-control px-3.5 text-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
    activeProps={{ className: cn('bg-primary-soft font-bold text-primary') }}
    inactiveProps={{ className: cn('font-semibold text-muted-foreground hover:bg-muted') }}
  >
    <Icon className="size-5 shrink-0" aria-hidden />
    {label}
  </Link>
)

export default NavItem
