import { format } from 'date-fns'
import type { ReactNode } from 'react'
import { Amount } from '@/components/ui/amount'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Link } from '@/router/navigation'
import type { DashboardCtx } from '../hooks/useDashboard'

const Stat = ({ label, value, hint, expenseId }: { label: string; value: ReactNode; hint: ReactNode; expenseId?: string }) => (
  <div className={cn('relative flex min-w-0 flex-col gap-1 rounded-tile bg-bg p-4', expenseId && 'hover:brightness-95')}>
    <dt className="text-sm text-muted-foreground">{label}</dt>
    <dd className="flex min-w-0 flex-col gap-0.5">
      {expenseId ? (
        // the link covers the whole tile (after:inset-0) while staying valid inside the <dl>
        <Link
          to="/expenses/$expenseId"
          params={{ expenseId }}
          className="flex min-w-0 flex-col gap-0.5 outline-none after:absolute after:inset-0 after:rounded-tile focus-visible:after:ring-2 focus-visible:after:ring-ring"
        >
          <span className="truncate text-2xl font-extrabold text-ink">{value}</span>
          <span className="truncate text-xs text-muted-foreground">{hint}</span>
        </Link>
      ) : (
        <>
          <span className="truncate text-2xl font-extrabold text-ink">{value}</span>
          <span className="truncate text-xs text-muted-foreground">{hint}</span>
        </>
      )}
    </dd>
  </div>
)

/** Desktop "Insights" (replaces Recent expenses): quick numbers for the selected period. */
const Insights = ({ ctx, className }: { ctx: DashboardCtx; className?: string }) => {
  const { insights, currency, categoryById } = ctx
  const { biggest, highestDay } = insights
  const biggestCategory = biggest ? categoryById.get(biggest.categoryId) : undefined

  return (
    <Card className={className}>
      <div className="flex flex-col gap-0.5">
        <CardTitle>Insights</CardTitle>
        <CardDescription>{ctx.subtitle}</CardDescription>
      </div>

      {insights.count === 0 ? (
        <p className="m-auto py-6 text-sm text-muted-foreground">Insights appear once there are expenses in this period.</p>
      ) : (
        <dl className="grid flex-1 grid-cols-2 gap-3 pt-3">
          <Stat
            label="Daily average"
            value={<Amount cents={insights.dailyAverageCents} currency={currency} size="lg" />}
            hint={`over ${insights.days} ${insights.days === 1 ? 'day' : 'days'}`}
          />
          <Stat
            label="Highest day"
            value={highestDay ? <Amount cents={highestDay.cents} currency={currency} size="lg" /> : '—'}
            hint={highestDay ? format(highestDay.date, 'EEE, MMM d') : ''}
          />
          {biggest && (
            // the biggest expense opens its editor
            <Stat
              label="Biggest expense"
              expenseId={biggest.id}
              value={<Amount cents={biggest.amountCents} currency={currency} size="lg" />}
              hint={`${biggestCategory?.emoji ?? '🧾'} ${biggest.note || biggestCategory?.name || 'Expense'} · ${format(biggest.spentAt, 'MMM d')}`}
            />
          )}
          <Stat
            label="Expenses"
            value={insights.count.toLocaleString('en-US')}
            hint={`on ${insights.activeDays} ${insights.activeDays === 1 ? 'day' : 'days'}`}
          />
        </dl>
      )}
    </Card>
  )
}

export default Insights
