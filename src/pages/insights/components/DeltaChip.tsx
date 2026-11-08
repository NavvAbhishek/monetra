import * as Icon from '@/components/icons'
import { cn } from '@/lib/utils'
import type { Delta } from '../helpers/InsightsHelpers'

/** "▲ 12%" in red (spent more), "▼ 8%" in green (spent less), or a plain word. */
const DeltaChip = ({ delta, className }: { delta: Delta; className?: string }) => {
  const base = 'inline-flex items-center gap-0.5 text-xs font-semibold whitespace-nowrap'
  switch (delta.direction) {
    case 'up':
      return (
        <span className={cn(base, 'text-danger', className)}>
          <Icon.ArrowUp className="size-3.5" aria-hidden />
          {delta.percent}%<span className="sr-only"> more</span>
        </span>
      )
    case 'down':
      return (
        <span className={cn(base, 'text-success', className)}>
          <Icon.ArrowDown className="size-3.5" aria-hidden />
          {delta.percent}%<span className="sr-only"> less</span>
        </span>
      )
    case 'same':
      return <span className={cn(base, 'text-muted-foreground', className)}>No change</span>
    case 'new':
      return <span className={cn(base, 'text-primary', className)}>New</span>
    case 'none':
      return <span className={cn(base, 'text-muted-foreground', className)}>—</span>
  }
}

export default DeltaChip
