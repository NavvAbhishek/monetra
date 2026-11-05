import ExpenseForm, { EXPENSE_FORM_ID } from '@/components/ExpenseForm'
import { useExpenseForm } from '@/components/ExpenseForm/hooks/useExpenseForm'
import * as Icon from '@/components/icons'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Link } from '@/router/navigation'
import type { ExpensesCtx } from '../hooks/useExpenses'
import { useState } from 'react'
import DeleteExpenseDialog from './DeleteExpenseDialog'

/**
 * Mobile full-screen add / edit (M3): back button, title, category tiles, amount card, save.
 * The page renders it with `key={editedExpense?.id ?? 'new'}` so the form restarts per expense.
 */
const ExpenseEditorScreen = ({ ctx }: { ctx: ExpensesCtx }) => {
  const { editedExpense, categories, currency, closeEditor } = ctx
  const formCtx = useExpenseForm({ expense: editedExpense, categories, currency, onSaved: closeEditor })
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <IconButton asChild variant="surface" size="lg" aria-label="Back to expenses">
          <Link to="/expenses">
            <Icon.ArrowLeft aria-hidden />
          </Link>
        </IconButton>
        {editedExpense && (
          <IconButton
            variant="danger-soft"
            size="lg"
            aria-label="Delete expense"
            onClick={() => setConfirmDelete(true)}
          >
            <Icon.Trash2 aria-hidden />
          </IconButton>
        )}
      </header>

      <h1 className="text-4xl leading-tight font-extrabold tracking-tight text-ink">
        {editedExpense ? (
          'Edit expense'
        ) : (
          <>
            What did you{' '}
            <br />
            spend on?
          </>
        )}
      </h1>

      <ExpenseForm ctx={formCtx} categories={categories} currency={currency} layout="screen" />

      {/* sticky: the save button is always reachable, above the iPhone home bar */}
      <div className="sticky bottom-0 -mx-5.5 mt-2 bg-bg/95 px-5.5 pt-3 pb-safe backdrop-blur">
        <Button type="submit" form={EXPENSE_FORM_ID} size="xl" fullWidth loading={formCtx.isSaving}>
          {editedExpense ? 'Save changes' : 'Add expense'}
        </Button>
      </div>

      <DeleteExpenseDialog
        expense={confirmDelete && editedExpense ? editedExpense : null}
        currency={currency}
        categoryName={editedExpense ? ctx.categoryById.get(editedExpense.categoryId)?.name : undefined}
        onClose={() => setConfirmDelete(false)}
        onDeleted={closeEditor}
      />
    </div>
  )
}

export default ExpenseEditorScreen
