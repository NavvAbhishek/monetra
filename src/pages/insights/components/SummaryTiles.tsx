import { format } from 'date-fns'
import type { ReactNode } from 'react'
import { Amount } from '@/components/ui/amount'
import { Link } from '@/router/navigation'
import { cn } from '@/lib/utils'
import type { InsightsCtx } from '../hooks/useInsights'
import { formatDay } from '../helpers/InsightsHelpers'
import DeltaChip from './DeltaChip'

const Tile = ({ label, children, hint, expenseId, className }: { label: string; children: ReactNode; hint: ReactNode; expenseId?: string; className?: string }) => (
  <div className={cn('relative flex min-w-0 flex-col gap-1 rounded-tile bg-card p-4', expenseId && 'hover:brightness-95', className)}>
    <dt className="text-sm text-muted-foreground">{label}</dt>
    <dd className="flex min-w-0 flex-col gap-0.5">
      {expenseId ? (
        // the link covers the whole tile while staying valid inside the <dl>
        <Link
          to="/expenses/$expenseId"
          params={{ expenseId }}
          className="flex min-w-0 flex-col gap-0.5 outline-none after:absolute after:inset-0 after:rounded-tile focus-visible:after:ring-2 focus-visible:after:ring-ring"
        >
          <span className="truncate text-xl font-extrabold text-ink">{children}</span>
          <span className="truncate text-xs text-muted-foreground">{hint}</span>
        </Link>
      ) : (
        <>
          <span className="truncate text-xl font-extrabold text-ink">{children}</span>
          <span className="truncate text-xs text-muted-foreground">{hint}</span>
        </>
      )}
    </dd>
  </div>
)

/** Six numbers for the period; the first one is compared with the previous period. */
const SummaryTiles = ({ ctx }: { ctx: InsightsCtx }) => {
  const { summary, currency, categoryById } = ctx
  const { biggest, highestDay } = summary
  const biggestCategory = biggest ? categoryById.get(biggest.categoryId) : undefined
  const compare = ctx.isAll ? ctx.periodLabel : ctx.totalDelta.direction === 'none' ? null : (
    <span className="flex items-center gap-1.5">
      <DeltaChip delta={ctx.totalDelta} />
      <span>vs {ctx.previousName}{ctx.previousPartial ? ' (same days)' : ''}</span>
    </span>
  )

  return (
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Tile label="Total spent" hint={compare ?? 'Nothing to compare yet'}>
        <Amount cents={summary.totalCents} currency={currency} size="md" />
      </Tile>
      <Tile label="Daily average" hint={`over ${summary.days} ${summary.days === 1 ? 'day' : 'days'}`}>
        <Amount cents={summary.dailyAverageCents} currency={currency} size="md" />
      </Tile>
      <Tile label="Highest day" hint={highestDay ? formatDay(highestDay.date) : 'No expenses'}>
        {highestDay ? <Amount cents={highestDay.cents} currency={currency} size="md" /> : '—'}
      </Tile>
      <Tile
        label="Biggest expense"
        expenseId={biggest?.id}
        hint={biggest ? `${biggestCategory?.emoji ?? '🧾'} ${biggest.note || biggestCategory?.name || 'Expense'}` : 'No expenses'}
      >
        {biggest ? <Amount cents={biggest.amountCents} currency={currency} size="md" /> : '—'}
      </Tile>
      <Tile label="Expenses" hint={`on ${summary.activeDays} ${summary.activeDays === 1 ? 'day' : 'days'}`}>
        {summary.count.toLocaleString('en-US')}
      </Tile>
      <Tile label="No-spend days" hint={summary.days > 0 ? `of ${summary.days} so far` : 'Period not started'}>
        {summary.noSpendDays}
      </Tile>
      {ctx.period !== 'week' && (
        <Tile label="Monthly average" hint="per month, on average">
          <Amount cents={summary.monthlyAverageCents} currency={currency} size="md" />
        </Tile>
      )}
      {(ctx.period === 'year' || ctx.isAll) && summary.highestMonth && (
        <Tile label="Highest month" hint={format(summary.highestMonth.monthStart, 'MMMM yyyy')}>
          <Amount cents={summary.highestMonth.cents} currency={currency} size="md" />
        </Tile>
      )}
      {summary.streak && summary.streak.days >= 3 && (
        <Tile
          label="Longest no-spend streak"
          hint={`${format(summary.streak.from, 'MMM d')} – ${format(summary.streak.to, 'MMM d, yyyy')}`}
        >
          {summary.streak.days} days
        </Tile>
      )}
      {ctx.projectedCents !== null && (
        <Tile label={`On track for this ${ctx.period}`} hint="if you keep this pace">
          <Amount cents={ctx.projectedCents} currency={currency} size="md" />
        </Tile>
      )}
    </dl>
  )
}

export default SummaryTiles
