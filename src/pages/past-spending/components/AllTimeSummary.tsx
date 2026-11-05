import { format } from 'date-fns'
import { Amount } from '@/components/ui/amount'
import { Card, CardTitle } from '@/components/ui/card'
import { EmojiBox } from '@/components/ui/emoji-box'
import { Progress } from '@/components/ui/progress'
import type { PastSpendingCtx } from '../hooks/usePastSpending'

/** Before Monetra + Tracked in Monetra = All-time total, and the all-time split by category. */
const AllTimeSummary = ({ ctx }: { ctx: PastSpendingCtx }) => {
  const { allTime, currency, firstTrackedAt } = ctx
  const top = allTime.rows[0]?.totalCents ?? 0

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <section aria-label="All-time total" className="flex flex-col gap-4 rounded-card bg-primary p-5 text-primary-foreground lg:col-span-2 lg:p-6.5">
        <div className="flex flex-col">
          <span className="text-sm lg:text-base">All-time total</span>
          <Amount cents={allTime.allTimeCents} currency={currency} size="hero" tone="inverse" />
        </div>
        <dl className="grid grid-cols-2 gap-3 border-t border-primary-foreground/20 pt-4">
          <div className="flex flex-col">
            <dt className="text-xs">Before Monetra</dt>
            <dd>
              <Amount cents={allTime.pastCents} currency={currency} size="md" tone="inverse" />
            </dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-xs">Tracked in Monetra{firstTrackedAt ? ` since ${format(firstTrackedAt, 'MMM d, yyyy')}` : ''}</dt>
            <dd>
              <Amount cents={allTime.trackedCents} currency={currency} size="md" tone="inverse" />
            </dd>
          </div>
        </dl>
      </section>

      <Card className="lg:col-span-3">
        <CardTitle className="pb-1.5">All-time by category</CardTitle>
        {allTime.rows.length === 0 ? (
          <p className="m-auto py-6 text-sm text-muted-foreground">Nothing yet — add past spending or track an expense.</p>
        ) : (
          <ul className="flex flex-col">
            {allTime.rows.map((row) => (
              <li key={row.key} className="flex items-center gap-3 py-1.5">
                <EmojiBox emoji={row.emoji} tone={row.colourIndex ?? 'neutral'} size="sm" />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex justify-between gap-2 text-base">
                    <span className="truncate font-semibold text-ink">{row.name}</span>
                    <Amount cents={row.totalCents} currency={currency} />
                  </div>
                  <Progress
                    value={top > 0 ? (row.totalCents / top) * 100 : 0}
                    tone={row.colourIndex ?? 'ink'}
                    label={`${row.name}: ${row.percent}% of all-time spending`}
                  />
                  <span className="text-xs text-muted-foreground">
                    Before Monetra <Amount cents={row.pastCents} currency={currency} className="text-xs font-semibold text-muted-foreground" />
                    {' · '}Tracked <Amount cents={row.trackedCents} currency={currency} className="text-xs font-semibold text-muted-foreground" />
                  </span>
                </div>
                <span className="w-8.5 text-right text-xs text-muted-foreground">{row.percent}%</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

export default AllTimeSummary
