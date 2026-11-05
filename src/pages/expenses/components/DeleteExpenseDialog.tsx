import { format } from 'date-fns'
import { Amount } from '@/components/ui/amount'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useDeleteExpenseMutation } from '@/queries/expenses/expenses-mutations'
import type { Expense } from '@/types/expense'

type DeleteExpenseDialogProps = {
  /** The expense to delete; null = closed. */
  expense: Expense | null
  currency: string
  categoryName?: string
  onClose: () => void
  /** After the delete succeeded (e.g. close the editor). */
  onDeleted?: () => void
}

/** "Delete this expense?" — nothing is deleted until the user confirms. */
const DeleteExpenseDialog = ({ expense, currency, categoryName, onClose, onDeleted }: DeleteExpenseDialogProps) => {
  const remove = useDeleteExpenseMutation()
  return (
    <ConfirmDialog
      open={!!expense}
      onOpenChange={(open) => !open && onClose()}
      title="Delete this expense?"
      loading={remove.isPending}
      description={
        expense && (
          <>
            <span className="font-semibold text-ink">{expense.note || categoryName || 'This expense'}</span> ·{' '}
            <Amount cents={expense.amountCents} currency={currency} className="text-ink" /> · {format(expense.spentAt, 'MMM d, yyyy')}
            <br />
            This can’t be undone.
          </>
        )
      }
      onConfirm={() =>
        expense &&
        remove.mutate(expense.id, {
          onSuccess: () => {
            onClose()
            onDeleted?.()
          },
        })
      }
    />
  )
}

export default DeleteExpenseDialog
