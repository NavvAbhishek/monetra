import { Amount } from '@/components/ui/amount'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { EmojiBox } from '@/components/ui/emoji-box'
import { Progress } from '@/components/ui/progress'
import { formatMoney } from '@/utils/money'
import type { InsightsCtx } from '../hooks/useInsights'
import DeltaChip from './DeltaChip'

/** Each category now against the previous period: where spending went up or down. */
const CategoryComparison = ({ ctx, className }: { ctx: InsightsCtx; className?: string }) => {
  const rows = ctx.categoryChanges
  const max = Math.max(...rows.map((r) => r.currentCents), 0)

  return (
    <Card className={className}>
      <CardTitle>Categories vs {ctx.previousName}</CardTitle>
      <CardDescription>Red means you spent more, green means less{ctx.previousPartial ? ' (same days of the previous period)' : ''}.</CardDescription>
      {rows.length === 0 ? (
        <p className="m-auto py-8 text-sm text-muted-foreground">No spending to compare yet.</p>
      ) : (
        <ul className="mt-3 grid gap-x-8 gap-y-1 lg:grid-cols-2">
          {rows.map(({ category, tone, currentCents, previousCents, delta }) => (
            <li key={category.id} className="flex items-center gap-3 py-1.5">
              <EmojiBox emoji={category.emoji} tone={tone} size="sm" />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-2 text-base">
                  <span className="truncate font-semibold text-ink">{category.name}</span>
                  <span className="flex items-baseline gap-2">
                    <Amount cents={currentCents} currency={ctx.currency} />
                    <DeltaChip delta={delta} className="w-16 justify-end" />
                  </span>
                </div>
                <Progress value={max > 0 ? (currentCents / max) * 100 : 0} tone={tone} label={`${category.name}: ${formatMoney(currentCents, ctx.currency)}`} />
                <p className="text-xs text-muted-foreground">
                  {previousCents > 0 ? `Before: ${formatMoney(previousCents, ctx.currency)}` : 'Nothing in the previous period'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default CategoryComparison
