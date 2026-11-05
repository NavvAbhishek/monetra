import { Amount } from '@/components/ui/amount'
import { EmojiBox } from '@/components/ui/emoji-box'
import { Link } from '@/router/navigation'
import type { DayGroup } from '@/utils/aggregate'
import { formatDayHeading } from '@/utils/period'
import type { ExpensesCtx } from '../hooks/useExpenses'
import SwipeableRow from './SwipeableRow'

/** One day on the mobile list (M2): heading with the day total, then its swipeable rows. */
const ExpenseDayGroup = ({ group, ctx }: { group: DayGroup; ctx: ExpensesCtx }) => (
  <section className="flex flex-col gap-2" aria-label={formatDayHeading(group.date, ctx.now)}>
    <div className="flex items-baseline justify-between px-1 text-sm text-muted-foreground">
      <h2 className="font-semibold">{formatDayHeading(group.date, ctx.now)}</h2>
      <Amount cents={group.totalCents} currency={ctx.currency} size="sm" tone="muted" className="text-sm font-normal" />
    </div>
    <ul className="overflow-hidden rounded-table bg-card">
      {group.items.map((expense) => {
        const category = ctx.categoryById.get(expense.categoryId)
        return (
          <li key={expense.id} className="border-b border-muted last:border-b-0">
            <SwipeableRow expenseId={expense.id} onDelete={() => ctx.askDelete(expense)}>
              <Link
                to="/expenses/$expenseId"
                params={{ expenseId: expense.id }}
                className="flex items-center gap-3 px-3.5 py-3 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              >
                <EmojiBox emoji={category?.emoji ?? '🧾'} tone={category?.colourIndex ?? 'neutral'} size="md" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-base font-semibold text-ink">{expense.note || category?.name || 'Expense'}</span>
                  <span className="text-xs text-muted-foreground">{category?.name ?? 'Uncategorised'}</span>
                </span>
                <Amount cents={expense.amountCents} currency={ctx.currency} size="sm" className="text-md" />
              </Link>
            </SwipeableRow>
          </li>
        )
      })}
    </ul>
  </section>
)

export default ExpenseDayGroup
