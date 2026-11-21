import { useState, type KeyboardEvent } from 'react'
import * as Icon from '@/components/icons'
import { Amount } from '@/components/ui/amount'
import { EmojiBox } from '@/components/ui/emoji-box'
import { IconButton } from '@/components/ui/icon-button'
import { cn } from '@/lib/utils'
import { Link } from '@/router/navigation'
import type { Category } from '@/types/category'
import type { Expense } from '@/types/expense'
import type { DayGroup } from '@/utils/aggregate'
import { formatDayHeading } from '@/utils/period'
import type { ExpensesCtx } from '../hooks/useExpenses'
import AmountBreakdownDialog from './AmountBreakdownDialog'
import SwipeableRow from './SwipeableRow'

const partCount = (expense: Expense) => expense.amountParts?.length ?? 0

/** Emoji, note (or category), "Category · 5 amounts", amount — the same on every screen size. */
const RowContent = ({ expense, category, currency }: { expense: Expense; category: Category | undefined; currency: string }) => (
  <>
    <EmojiBox emoji={category?.emoji ?? '🧾'} tone={category?.colourIndex ?? 'neutral'} size="md" />
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="truncate text-base font-semibold text-ink">{expense.note || category?.name || 'Expense'}</span>
      <span className="truncate text-xs text-muted-foreground">
        {category?.name ?? 'Uncategorised'}
        {partCount(expense) >= 2 && ` · ${partCount(expense)} amounts`}
      </span>
    </span>
    <Amount cents={expense.amountCents} currency={currency} size="sm" className="text-md" />
  </>
)

/**
 * One day of the expenses list (M2 — used on desktop too, user request 2026-11-20): heading with the day total, then its rows.
 * A row made of several amounts opens a small pop-up with them.
 * Phones: tap a row to edit (or to see its amounts), swipe left for Edit / Delete.
 * Desktop: Edit / Delete buttons on each row; clicking a row only opens the amounts pop-up.
 */
const ExpenseDayGroup = ({ group, ctx }: { group: DayGroup; ctx: ExpensesCtx }) => {
  const [breakdown, setBreakdown] = useState<Expense | null>(null)

  return (
    <section className="flex flex-col gap-2" aria-label={formatDayHeading(group.date, ctx.now)}>
      <div className="flex items-baseline justify-between px-1 text-sm text-muted-foreground">
        <h2 className="font-semibold">{formatDayHeading(group.date, ctx.now)}</h2>
        <Amount cents={group.totalCents} currency={ctx.currency} size="sm" tone="muted" className="text-sm font-normal" />
      </div>
      <ul className="overflow-hidden rounded-table bg-card">
        {group.items.map((expense) => {
          const category = ctx.categoryById.get(expense.categoryId)
          const hasParts = partCount(expense) >= 2
          const label = expense.note || category?.name || 'expense'

          if (ctx.isMobile) {
            return (
              <li key={expense.id} className="border-b border-muted last:border-b-0">
                <SwipeableRow expenseId={expense.id} onDelete={() => ctx.askDelete(expense)}>
                  <Link
                    to="/expenses/$expenseId"
                    params={{ expenseId: expense.id }}
                    onClick={(event) => {
                      if (!hasParts) return
                      event.preventDefault()
                      setBreakdown(expense)
                    }}
                    className="flex items-center gap-3 px-3.5 py-3 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                  >
                    <RowContent expense={expense} category={category} currency={ctx.currency} />
                  </Link>
                </SwipeableRow>
              </li>
            )
          }

          const openBreakdown = () => setBreakdown(expense)
          const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              openBreakdown()
            }
          }
          return (
            <li key={expense.id} className="flex items-center gap-3 border-b border-muted pr-4 last:border-b-0">
              <div
                {...(hasParts
                  ? { role: 'button', tabIndex: 0, onClick: openBreakdown, onKeyDown, 'aria-label': `${label}: show its ${partCount(expense)} amounts` }
                  : {})}
                className={cn(
                  'flex min-w-0 flex-1 items-center gap-3 py-3 pl-4 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                  hasParts && 'cursor-pointer hover:bg-bg/60',
                )}
              >
                <RowContent expense={expense} category={category} currency={ctx.currency} />
              </div>
              <span className="flex shrink-0 gap-1.5">
                <IconButton asChild variant="muted" size="sm" aria-label={`Edit ${label}`}>
                  <Link to="/expenses/$expenseId" params={{ expenseId: expense.id }}>
                    <Icon.Pencil aria-hidden />
                  </Link>
                </IconButton>
                <IconButton variant="danger-soft" size="sm" aria-label={`Delete ${label}`} onClick={() => ctx.askDelete(expense)}>
                  <Icon.Trash2 aria-hidden />
                </IconButton>
              </span>
            </li>
          )
        })}
      </ul>
      {breakdown && (
        <AmountBreakdownDialog
          expense={breakdown}
          category={ctx.categoryById.get(breakdown.categoryId)}
          currency={ctx.currency}
          onClose={() => setBreakdown(null)}
        />
      )}
    </section>
  )
}

export default ExpenseDayGroup
