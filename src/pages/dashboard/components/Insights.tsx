import { format } from 'date-fns'
import type { ReactNode } from 'react'
import { Amount } from '@/components/ui/amount'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Link } from '@/router/navigation'
import type { DashboardCtx } from '../hooks/useDashboard'

/** A monthly average / highest month only make sense once the period covers more than a month. */
const LONG_PERIOD_DAYS = 45

const Stat = ({ label, value, hint, expenseId, mobile }: { label: string; value: ReactNode; hint: ReactNode; expenseId?: string; mobile?: boolean }) => (
  <div className={cn('relative flex min-w-0 flex-col gap-1 rounded-tile', mobile ? 'bg-card p-3.5' : 'bg-bg p-4', expenseId && 'hover:brightness-95')}>
    <dt className="text-sm text-muted-foreground">{label}</dt>
    <dd className="flex min-w-0 flex-col gap-0.5">
      {expenseId ? (
        // the link covers the whole tile (after:inset-0) while staying valid inside the <dl>
        <Link
          to="/expenses/$expenseId"
          params={{ expenseId }}
          className="flex min-w-0 flex-col gap-0.5 outline-none after:absolute after:inset-0 after:rounded-tile focus-visible:after:ring-2 focus-visible:after:ring-ring"
        >
          <span className={cn('truncate font-extrabold text-ink', mobile ? 'text-xl' : 'text-2xl')}>{value}</span>
          <span className="truncate text-xs text-muted-foreground">{hint}</span>
        </Link>
      ) : (
        <>
          <span className={cn('truncate font-extrabold text-ink', mobile ? 'text-xl' : 'text-2xl')}>{value}</span>
          <span className="truncate text-xs text-muted-foreground">{hint}</span>
        </>
      )}
    </dd>
  </div>
)

/** "Insights" (replaces Recent expenses): quick numbers for the selected period. A card on desktop, plain tiles under a heading on phones. */
const Insights = ({ ctx, className }: { ctx: DashboardCtx; className?: string }) => {
  const { insights, currency, categoryById } = ctx
  const { biggest, highestDay } = insights
  const biggestCategory = biggest ? categoryById.get(biggest.categoryId) : undefined

  const mobile = ctx.isMobile
  const amountSize = mobile ? 'md' : 'lg'

  const stats =
    ctx.totalCents === 0 ? (
      <p className="m-auto py-6 text-sm text-muted-foreground">Insights appear once there are expenses in this period.</p>
    ) : (
      <dl className={cn('grid', mobile ? 'grid-cols-2 gap-2.5' : cn('flex-1 gap-3 pt-3', insights.days >= LONG_PERIOD_DAYS ? 'grid-cols-3 2xl:grid-cols-6' : 'grid-cols-4'))}>
        <Stat
          mobile={mobile}
          label="Daily average"
          value={<Amount cents={insights.dailyAverageCents} currency={currency} size={amountSize} />}
          hint={`over ${insights.days} ${insights.days === 1 ? 'day' : 'days'}`}
        />
        <Stat
          mobile={mobile}
          label="Highest day"
          value={highestDay ? <Amount cents={highestDay.cents} currency={currency} size={amountSize} /> : '—'}
          hint={highestDay ? format(highestDay.date, 'EEE, MMM d') : ''}
        />
        {biggest && (
          // the biggest expense opens its editor
          <Stat
            mobile={mobile}
            label="Biggest expense"
            expenseId={biggest.id}
            value={<Amount cents={biggest.amountCents} currency={currency} size={amountSize} />}
            hint={`${biggestCategory?.emoji ?? '🧾'} ${biggest.note || biggestCategory?.name || 'Expense'} · ${format(biggest.spentAt, 'MMM d')}`}
          />
        )}
        <Stat
          mobile={mobile}
          label="Expenses"
          value={insights.count.toLocaleString('en-US')}
          hint={`on ${insights.activeDays} ${insights.activeDays === 1 ? 'day' : 'days'}`}
        />
        {/* long periods only: a monthly average means little for a week */}
        {insights.days >= LONG_PERIOD_DAYS && (
          <>
            <Stat
              mobile={mobile}
              label="Monthly average"
              value={<Amount cents={insights.monthlyAverageCents} currency={currency} size={amountSize} />}
              hint="per month"
            />
            <Stat
              mobile={mobile}
              label="Highest month"
              value={insights.highestMonth ? <Amount cents={insights.highestMonth.cents} currency={currency} size={amountSize} /> : '—'}
              hint={insights.highestMonth ? format(insights.highestMonth.monthStart, 'MMMM yyyy') : ''}
            />
          </>
        )}
      </dl>
    )

  if (mobile) {
    return (
      <section className={cn('flex flex-col gap-2.5', className)} aria-labelledby="dash-insights">
        <div className="flex items-baseline justify-between pt-1">
          <h2 id="dash-insights" className="text-xl font-bold text-ink">
            Insights
          </h2>
          <Link to="/insights" className="text-sm font-semibold text-primary hover:text-primary-hover">
            See all
          </Link>
        </div>
        {stats}
      </section>
    )
  }

  return (
    <Card className={className}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <CardTitle>Insights</CardTitle>
          <CardDescription>{ctx.subtitle}</CardDescription>
        </div>
        <Link to="/insights" className="pt-1 text-sm font-semibold text-primary hover:text-primary-hover">
          See all
        </Link>
      </div>
      {stats}
    </Card>
  )
}

export default Insights
