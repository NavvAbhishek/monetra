import { Amount } from '@/components/ui/amount'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { EmojiBox } from '@/components/ui/emoji-box'
import { Link } from '@/router/navigation'
import { formatDay } from '../helpers/InsightsHelpers'
import type { InsightsCtx } from '../hooks/useInsights'

/** The five biggest expenses of the period; each opens its editor. */
const TopExpenses = ({ ctx, className }: { ctx: InsightsCtx; className?: string }) => (
  <Card className={className}>
    <CardTitle>Biggest expenses</CardTitle>
    <CardDescription>Top 5 in {ctx.periodLabel}</CardDescription>
    {ctx.topExpenses.length === 0 ? (
      <p className="m-auto py-8 text-sm text-muted-foreground">No expenses in this period yet.</p>
    ) : (
      <ol className="mt-3 flex flex-col">
        {ctx.topExpenses.map((expense, i) => {
          const category = ctx.categoryById.get(expense.categoryId)
          return (
            <li key={expense.id}>
              <Link
                to="/expenses/$expenseId"
                params={{ expenseId: expense.id }}
                className="-mx-2 flex items-center gap-3 rounded-control px-2 py-2 outline-none hover:bg-bg focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="w-4 text-center text-sm font-bold text-muted-foreground">{i + 1}</span>
                <EmojiBox emoji={category?.emoji ?? '🧾'} tone={category?.colourIndex ?? 'neutral'} size="sm" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-base font-semibold text-ink">{expense.note || category?.name || 'Expense'}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {category?.name ?? 'Deleted category'} · {formatDay(expense.spentAt)}
                  </span>
                </span>
                <Amount cents={expense.amountCents} currency={ctx.currency} />
              </Link>
            </li>
          )
        })}
      </ol>
    )}
  </Card>
)

export default TopExpenses
