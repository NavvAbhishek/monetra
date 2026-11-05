import { format } from 'date-fns'
import * as Icon from '@/components/icons'
import { Amount } from '@/components/ui/amount'
import { Badge } from '@/components/ui/badge'
import { EmojiBox } from '@/components/ui/emoji-box'
import { IconButton } from '@/components/ui/icon-button'
import { Link, useNavigate } from '@/router/navigation'
import type { ExpensesCtx } from '../hooks/useExpenses'

const head = 'h-11.5 px-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase first:pl-5.5 last:pr-5.5'

/** Desktop table (D2): date, note, category, amount, edit / delete. Click a row to edit. */
const ExpensesTable = ({ ctx }: { ctx: ExpensesCtx }) => {
  const navigate = useNavigate()
  const { expenses, categoryById, currency } = ctx

  return (
    <div className="overflow-hidden rounded-table bg-card">
      <table className="w-full table-fixed border-collapse text-left text-base">
        <caption className="sr-only">Expenses</caption>
        <thead>
          <tr className="border-b border-muted">
            <th scope="col" className={`${head} w-30`}>Date</th>
            <th scope="col" className={head}>Note</th>
            <th scope="col" className={`${head} w-50`}>Category</th>
            <th scope="col" className={`${head} w-35 text-right`}>Amount</th>
            <th scope="col" className={`${head} w-28`}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => {
            const category = categoryById.get(expense.categoryId)
            const tone = category?.colourIndex ?? 'neutral'
            return (
              <tr
                key={expense.id}
                onClick={() => void navigate({ to: '/expenses/$expenseId', params: { expenseId: expense.id } })}
                className="h-14 cursor-pointer border-b border-line-soft hover:bg-bg/60"
              >
                <td className="pl-5.5 text-muted-foreground">{format(expense.spentAt, 'MMM d')}</td>
                <td className="px-3">
                  <span className="flex items-center gap-2.5 font-semibold text-ink">
                    <EmojiBox emoji={category?.emoji ?? '🧾'} tone={tone} size="sm" />
                    <span className="truncate">{expense.note || <span className="font-normal text-muted-foreground">No note</span>}</span>
                  </span>
                </td>
                <td className="px-3">
                  <Badge tone={tone}>{category?.name ?? 'Uncategorised'}</Badge>
                </td>
                <td className="px-3 text-right">
                  <Amount cents={expense.amountCents} currency={currency} />
                </td>
                <td className="pr-5.5 pl-3">
                  <span className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <IconButton asChild variant="muted" size="sm" aria-label={`Edit ${expense.note || 'expense'}`}>
                      <Link to="/expenses/$expenseId" params={{ expenseId: expense.id }}>
                        <Icon.Pencil aria-hidden />
                      </Link>
                    </IconButton>
                    <IconButton
                      variant="danger-soft"
                      size="sm"
                      aria-label={`Delete ${expense.note || 'expense'}`}
                      onClick={() => ctx.requestDelete(expense)}
                    >
                      <Icon.Trash2 aria-hidden />
                    </IconButton>
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="flex h-13 items-center justify-between px-5.5 text-sm text-muted-foreground">
        <span>
          Showing {expenses.length} of {ctx.totalInPeriodCount}
        </span>
        <span className="font-bold text-ink">
          Total <Amount cents={ctx.totalCents} currency={currency} size="sm" className="text-sm" />
        </span>
      </div>
    </div>
  )
}

export default ExpensesTable
