import ExpenseForm, { EXPENSE_FORM_ID } from '@/components/ExpenseForm'
import { useExpenseForm } from '@/components/ExpenseForm/hooks/useExpenseForm'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import type { ExpensesCtx } from '../hooks/useExpenses'
import { useDeleteExpenseNow } from '../hooks/useDeleteExpenseNow'
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
  const { deleteNow, isDeleting } = useDeleteExpenseNow(closeEditor)

  return (
    <Dialog open onOpenChange={(open) => !open && closeEditor()}>
      <DialogContent size="md">
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
                  loading={isDeleting}
                  onClick={() => deleteNow(editedExpense.id)}
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
    </Dialog>
  )
}

export default ExpenseDialog
