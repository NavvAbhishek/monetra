import type { ComponentType, SVGProps } from 'react'
import * as Icon from '@/components/icons'
import { IconButton } from '@/components/ui/icon-button'
import { MORE_LINK, MORE_TAB_PATHS, NAV_LINKS, SETTINGS_LINK } from '@/constant/navLinksData'
import { cn } from '@/lib/utils'
import { Link, useLocation } from '@/router/navigation'

type TabProps = {
  to: (typeof NAV_LINKS)[number]['to'] | '/settings' | '/more'
  /** Force the highlighted state (More stays active on Categories, Insights, …). */
  active?: boolean
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

const Tab = ({ to, label, icon: TabIcon, active }: TabProps) => (
  <Link
    to={to}
    aria-label={label}
    activeOptions={{ exact: to === '/' }}
    className="grid size-11 place-items-center rounded-icon outline-none focus-visible:ring-2 focus-visible:ring-ring"
    activeProps={{ className: 'text-primary' }}
    inactiveProps={{ className: active ? 'text-primary' : 'text-muted-foreground' }} // muted-2 is below 3:1 for icons
  >
    <TabIcon className="size-6" aria-hidden />
  </Link>
)

/** Mobile bottom bar: Dashboard, Expenses, raised "+", More (hub), Settings. */
const MobileTabBar = ({ className }: { className?: string }) => {
  const [dashboard, expenses] = NAV_LINKS
  const { pathname } = useLocation()
  const moreActive = MORE_TAB_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
  return (
    <nav
      aria-label="Tab bar"
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 items-center justify-items-center min-h-20 rounded-t-bar bg-card pt-2 pb-safe shadow-tabbar',
        className,
      )}
    >
      <Tab {...dashboard} />
      <Tab {...expenses} />
      <IconButton asChild variant="primary" size="fab" aria-label="Add expense" className="-mt-7.5">
        <Link to="/expenses/new">
          <Icon.Plus aria-hidden />
        </Link>
      </IconButton>
      <Tab {...MORE_LINK} active={moreActive} />
      <Tab {...SETTINGS_LINK} />
    </nav>
  )
}

export default MobileTabBar
