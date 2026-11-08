import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatCompactNumber, formatMoney } from '@/utils/money'
import type { InsightsCtx } from '../hooks/useInsights'

/** Average spending for each weekday: which days of the week cost the most. */
const WeekdayChart = ({ ctx, className }: { ctx: InsightsCtx; className?: string }) => {
  const bars = ctx.weekdayBars
  const max = Math.max(...bars.map((b) => b.averageCents), 0)
  const top = max > 0 ? bars.find((b) => b.averageCents === max) : undefined
  const summary = top
    ? `Most on ${top.label}: ${formatMoney(top.averageCents, ctx.currency)} on average`
    : 'No spending in this period yet'

  return (
    <Card className={className}>
      <CardTitle>By weekday</CardTitle>
      <CardDescription>{summary}</CardDescription>
      <figure
        role="img"
        aria-label={`Average spending per weekday: ${bars.map((b) => `${b.label} ${formatMoney(b.averageCents, ctx.currency)}`).join(', ')}`}
        className="mt-4 flex flex-1 items-end gap-2.5"
      >
        {bars.map((bar) => {
          const isTop = max > 0 && bar.averageCents === max
          return (
            <div key={bar.label} className="flex h-full min-h-44 min-w-0 flex-1 flex-col items-center justify-end gap-1.5" aria-hidden>
              <span className={cn('text-2xs font-semibold', isTop ? 'text-ink' : 'text-muted-foreground')}>
                {bar.averageCents > 0 ? formatCompactNumber(bar.averageCents, ctx.currency) : ''}
              </span>
              <div
                className={cn('w-full max-w-11 rounded-chip', isTop ? 'bg-primary' : bar.averageCents > 0 ? 'bg-bar' : 'bg-bar-empty')}
                style={{ height: `${bar.averageCents > 0 ? Math.max(6, (bar.averageCents / max) * 80) : 3}%` }}
              />
              <span className={cn('text-xs', isTop ? 'font-bold text-ink' : 'font-medium text-muted-foreground')}>{bar.label}</span>
            </div>
          )
        })}
      </figure>
    </Card>
  )
}

export default WeekdayChart
