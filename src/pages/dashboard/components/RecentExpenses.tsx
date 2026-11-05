import { format } from 'date-fns'
import { Amount } from '@/components/ui/amount'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { EmojiBox } from '@/components/ui/emoji-box'
import { Link } from '@/router/navigation'
import type { DashboardCtx } from '../hooks/useDashboard'

/** Desktop: the latest 5 expenses of the period; each opens the editor (D1). */
const RecentExpenses = ({ ctx, className }: { ctx: DashboardCtx; className?: string }) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle>Recent expenses</CardTitle>
      <Link to="/expenses" className="text-sm font-semibold text-primary hover:text-primary-hover">
        See all
      </Link>
    </CardHeader>
    {ctx.recent.length === 0 ? (
      <p className="m-auto py-6 text-sm text-muted-foreground">Nothing yet in this period.</p>
    ) : (
      <ul className="flex flex-col">
        {ctx.recent.map((expense) => {
          const category = ctx.categoryById.get(expense.categoryId)
          return (
            <li key={expense.id}>
              <Link
                to="/expenses/$expenseId"
                params={{ expenseId: expense.id }}
                className="-mx-2 flex items-center gap-3 rounded-control px-2 py-1.5 outline-none hover:bg-bg focus-visible:ring-2 focus-visible:ring-ring"
              >
                <EmojiBox emoji={category?.emoji ?? '🧾'} tone={category?.colourIndex ?? 'neutral'} size="sm" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-base font-semibold text-ink">{expense.note || category?.name || 'Expense'}</span>
                  <span className="text-xs text-muted-foreground">
                    {category?.name ?? 'Uncategorised'} · {format(expense.spentAt, 'MMM d')}
                  </span>
                </span>
                <Amount cents={expense.amountCents} currency={ctx.currency} />
              </Link>
            </li>
          )
        })}
      </ul>
    )}
  </Card>
)

export default RecentExpenses
