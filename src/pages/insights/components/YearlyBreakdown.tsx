import { Amount } from '@/components/ui/amount'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/utils/money'
import type { InsightsCtx } from '../hooks/useInsights'
import DeltaChip from './DeltaChip'

/** All time: one row per year with its total and monthly average, and how that average changed from the year before. */
const YearlyBreakdown = ({ ctx, className }: { ctx: InsightsCtx; className?: string }) => {
  const rows = ctx.yearSummaries
  if (rows.length < 2) return null
  const max = Math.max(...rows.map((r) => r.totalCents), 0)

  return (
    <Card className={className}>
      <CardTitle>By year</CardTitle>
      <CardDescription>Compared by average per month, so a part-year is fair.</CardDescription>
      <ul className="mt-3 flex flex-col">
        {[...rows].reverse().map((row) => (
          <li key={row.year} className="flex items-center gap-4 border-t border-line-soft py-3 first:border-t-0">
            <span className="w-12 text-lg font-bold text-ink">{row.year}</span>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <Amount cents={row.totalCents} currency={ctx.currency} />
                <span className="text-xs text-muted-foreground">
                  {formatMoney(row.monthlyAverageCents, ctx.currency)} / month · {row.months} {row.months === 1 ? 'month' : 'months'}
                </span>
              </div>
              <Progress value={max > 0 ? (row.totalCents / max) * 100 : 0} label={`${row.year}: ${formatMoney(row.totalCents, ctx.currency)}`} />
            </div>
            <DeltaChip delta={row.delta} className={cn('w-16 justify-end')} />
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default YearlyBreakdown
