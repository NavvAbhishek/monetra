import type { ComponentType, SVGProps } from 'react'
import * as Icon from '@/components/icons'
import { Link, type LinkProps } from '@/router/navigation'

type Props = {
  to: LinkProps['to']
  icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  description: string
}

/** One shortcut on the More page: icon, title, one line, chevron. */
const HubLink = ({ to, icon: LinkIcon, title, description }: Props) => (
  <Link
    to={to}
    className="flex items-center gap-3 rounded-tile bg-card p-4 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
  >
    <span className="grid size-10.5 shrink-0 place-items-center rounded-icon bg-primary-soft text-primary-hover" aria-hidden>
      <LinkIcon className="size-5" />
    </span>
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="text-base font-bold text-ink">{title}</span>
      <span className="truncate text-sm text-muted-foreground">{description}</span>
    </span>
    <Icon.ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
  </Link>
)

export default HubLink
