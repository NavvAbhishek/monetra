import { useDeleteExpenseMutation } from '@/queries/expenses/expenses-mutations'
import { Notification } from '@/utils/notification'

/** Delete from inside the editor (modal / full screen): immediate, then close the editor. */
export const useDeleteExpenseNow = (onDone: () => void) => {
  const remove = useDeleteExpenseMutation()
  return {
    deleteNow: (id: string) =>
      remove.mutate(id, {
        onSuccess: () => {
          Notification.success('Expense deleted')
          onDone()
        },
      }),
    isDeleting: remove.isPending,
  }
}
