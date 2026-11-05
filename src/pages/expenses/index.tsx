import { useState } from 'react'
import * as Icon from '@/components/icons'
import PageLoader from '@/components/PageLoader'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { IconButton } from '@/components/ui/icon-button'
import { PageHeader } from '@/components/ui/page-header'
import { Link } from '@/router/navigation'
import { formatMoney } from '@/utils/money'
import ExpenseDayGroup from './components/ExpenseDayGroup'
import ExpenseDialog from './components/ExpenseDialog'
import ExpenseEditorScreen from './components/ExpenseEditorScreen'
import ExpenseNotFound from './components/ExpenseNotFound'
import ExpensesSkeleton from './components/ExpensesSkeleton'
import ExpensesTable from './components/ExpensesTable'
import ExpensesToolbar from './components/ExpensesToolbar'
import MobileFilters from './components/MobileFilters'
import { useExpenses } from './hooks/useExpenses'

/**
 * /expenses, /expenses/new and /expenses/$expenseId all render this page (CLAUDE.md §4).
 * Desktop (D2/D3): table + add / edit modal. Mobile (M2/M3): day-grouped list, or the full-screen editor.
 */
const Expenses = () => {
  const ctx = useExpenses()
  const { isMobile, mode, isLoading, isError, isEditorLoading, editorNotFound, editedExpense } = ctx
  const [searchOpen, setSearchOpen] = useState(false)
  const editing = mode.kind !== 'list'

  // ---- mobile editor (M3) ----
  if (isMobile && editing) {
    if (isEditorLoading || isLoading) return <PageLoader />
    if (editorNotFound) return <ExpenseNotFound />
    return <ExpenseEditorScreen key={editedExpense?.id ?? 'new'} ctx={ctx} />
  }

  const total = formatMoney(ctx.totalCents, ctx.currency)
  const entries = `${ctx.expenses.length} ${ctx.expenses.length === 1 ? 'entry' : 'entries'}`

  const content = isLoading ? (
    <ExpensesSkeleton />
  ) : isError ? (
    <EmptyState
      emoji="⚠️"
      title="Couldn’t load your expenses"
      description="Check your connection and try again."
      action={<Button onClick={ctx.retry}>Try again</Button>}
    />
  ) : ctx.totalInPeriodCount === 0 ? (
    <EmptyState
      title={ctx.isCurrentPeriod ? `No expenses ${ctx.periodHeading.toLowerCase()}` : `No expenses in ${ctx.periodLabel}`}
      description="Add one and it will show up here."
      action={
        <Button asChild>
          <Link to="/expenses/new">+ Add expense</Link>
        </Button>
      }
    />
  ) : ctx.expenses.length === 0 ? (
    <EmptyState
      emoji="🔍"
      title="No matches"
      description="No expenses match your search or category."
      action={
        <Button variant="secondary" onClick={ctx.clearFilters}>
          Clear filters
        </Button>
      }
    />
  ) : isMobile ? (
    <div className="flex flex-col gap-3.5">
      {ctx.dayGroups.map((group) => (
        <ExpenseDayGroup key={group.key} group={group} ctx={ctx} />
      ))}
    </div>
  ) : (
    <ExpensesTable ctx={ctx} />
  )

  return (
    <div className="flex flex-col gap-4.5">
      <PageHeader
        title="Expenses"
        description={isMobile ? `${ctx.periodHeading} · ${total}` : `${ctx.periodHeading} · ${entries} · ${total}`}
        actions={
          isMobile ? (
            <IconButton
              variant="surface"
              size="lg"
              aria-label={searchOpen ? 'Hide search' : 'Search notes'}
              aria-pressed={searchOpen}
              onClick={() => setSearchOpen((open) => !open)}
            >
              {searchOpen ? <Icon.X aria-hidden /> : <Icon.Search aria-hidden />}
            </IconButton>
          ) : (
            <Button asChild>
              <Link to="/expenses/new">+ Add expense</Link>
            </Button>
          )
        }
        className="flex-nowrap"
      />

      {isMobile ? <MobileFilters ctx={ctx} searchOpen={searchOpen} /> : <ExpensesToolbar ctx={ctx} />}

      {content}

      {/* ---- desktop add / edit modal (D3) ---- */}
      {!isMobile && editing && !isEditorLoading && !isLoading && (
        <ExpenseDialog key={editedExpense?.id ?? 'new'} ctx={ctx} />
      )}
    </div>
  )
}

export default Expenses
