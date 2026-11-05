import { useCallback, useEffect, useRef, useState } from 'react'
import { useDeleteExpenseMutation } from '@/queries/expenses/expenses-mutations'
import type { Expense } from '@/types/expense'
import { Notification } from '@/utils/notification'
import { UNDO_WINDOW_MS } from '../helpers/ExpensesHelpers'

/**
 * "Delete with Undo" (CLAUDE.md §7.3): the row disappears at once and a toast offers Undo.
 * The real delete runs after 5 s — or immediately when the user leaves the page, so a delete
 * is never silently dropped.
 */
export const useExpenseDeleteUndo = () => {
  const remove = useDeleteExpenseMutation()
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set())
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  const forget = (id: string) =>
    setPendingIds((current) => {
      const next = new Set(current)
      next.delete(id)
      return next
    })

  const commit = useCallback(
    (id: string) => {
      timers.current.delete(id)
      remove.mutate(id, { onSettled: () => forget(id) })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `remove.mutate` is stable
    [remove.mutate],
  )

  const requestDelete = (expense: Expense) => {
    setPendingIds((current) => new Set(current).add(expense.id))
    timers.current.set(expense.id, setTimeout(() => commit(expense.id), UNDO_WINDOW_MS))
    Notification.undo(
      'Expense deleted',
      () => {
        clearTimeout(timers.current.get(expense.id))
        timers.current.delete(expense.id)
        forget(expense.id)
      },
      UNDO_WINDOW_MS,
    )
  }

  // Leaving the page commits whatever is still waiting.
  useEffect(() => {
    const pending = timers.current
    return () => {
      pending.forEach((timer, id) => {
        clearTimeout(timer)
        commit(id)
      })
    }
  }, [commit])

  return { pendingIds, requestDelete }
}
