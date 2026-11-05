import type { ComponentType, SVGProps } from 'react'
import * as Icon from '@/components/icons'
import { IconButton } from '@/components/ui/icon-button'
import { NAV_LINKS, SETTINGS_LINK } from '@/constant/navLinksData'
import { cn } from '@/lib/utils'
import { Link } from '@/router/navigation'

type TabProps = {
  to: (typeof NAV_LINKS)[number]['to'] | '/settings'
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

const Tab = ({ to, label, icon: TabIcon }: TabProps) => (
  <Link
    to={to}
    aria-label={label}
    activeOptions={{ exact: to === '/' }}
    className="grid size-11 place-items-center rounded-icon outline-none focus-visible:ring-2 focus-visible:ring-ring"
    activeProps={{ className: 'text-primary' }}
    inactiveProps={{ className: 'text-muted-2' }}
  >
    <TabIcon className="size-6" aria-hidden />
  </Link>
)

/** Mobile bottom bar: 4 tabs + raised "+" button in the middle (M1, M2, M4). */
const MobileTabBar = ({ className }: { className?: string }) => {
  const [dashboard, expenses, categories] = NAV_LINKS
  return (
    <nav
      aria-label="Tab bar"
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 grid h-20 grid-cols-5 items-center justify-items-center rounded-t-bar bg-card pb-2.5 shadow-tabbar',
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
      <Tab {...categories} />
      <Tab {...SETTINGS_LINK} />
    </nav>
  )
}

export default MobileTabBar
