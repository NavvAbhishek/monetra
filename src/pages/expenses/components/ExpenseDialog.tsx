import ExpenseForm, { EXPENSE_FORM_ID } from '@/components/ExpenseForm'
import { useExpenseForm } from '@/components/ExpenseForm/hooks/useExpenseForm'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import type { ExpensesCtx } from '../hooks/useExpenses'
import { useState } from 'react'
import DeleteExpenseDialog from './DeleteExpenseDialog'
import ExpenseNotFound from './ExpenseNotFound'

/**
 * Desktop add / edit modal over the list (D3). Open while the URL is /expenses/new or
 * /expenses/$expenseId; closing it goes back to /expenses.
 * The page renders it with `key={editedExpense?.id ?? 'new'}` so the form restarts per expense.
 */
const ExpenseDialog = ({ ctx }: { ctx: ExpensesCtx }) => {
  const { mode, editedExpense, editorNotFound, categories, currency, closeEditor } = ctx
  const isEdit = mode.kind === 'edit'
  const formCtx = useExpenseForm({ expense: editedExpense, categories, currency, onSaved: closeEditor })
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <Dialog open onOpenChange={(open) => !open && closeEditor()}>
      <DialogContent
        size="md"
        onOpenAutoFocus={(e) => {
          // start typing the amount right away (Radix would focus the close button)
          const amount = document.getElementById('expense-amount')
          if (amount) {
            e.preventDefault()
            amount.focus()
          }
        }}
      >
        <DialogHeader title={isEdit ? 'Edit expense' : 'Add expense'} />

        {editorNotFound ? (
          <ExpenseNotFound />
        ) : (
          <>
            <ExpenseForm ctx={formCtx} categories={categories} currency={currency} layout="dialog" />
            <DialogFooter>
              {editedExpense && (
                <Button
                  variant="danger-ghost"
                  size="lg"
                  className="px-1.5"
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete
                </Button>
              )}
              <span className="flex-1" />
              <DialogClose asChild>
                <Button variant="surface" size="lg">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" form={EXPENSE_FORM_ID} size="lg" loading={formCtx.isSaving}>
                {isEdit ? 'Save changes' : 'Add expense'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
      <DeleteExpenseDialog
        expense={confirmDelete && editedExpense ? editedExpense : null}
        currency={currency}
        categoryName={editedExpense ? ctx.categoryById.get(editedExpense.categoryId)?.name : undefined}
        onClose={() => setConfirmDelete(false)}
        onDeleted={closeEditor}
      />
    </Dialog>
  )
}

export default ExpenseDialog
