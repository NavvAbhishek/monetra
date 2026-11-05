import { useMutation, useQueryClient } from '@tanstack/react-query'
import API from '@/services'
import type { CategoryInput } from '@/types/category'
import { Notification } from '@/utils/notification'
import { QUERY_KEYS } from '../query-keys'
import { errorMessage, requireUid } from '../session'

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CategoryInput) => API.categories.category_create(requireUid(), input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories })
      Notification.success('Category created')
    },
    onError: (error) => Notification.error(errorMessage(error)),
  })
}

export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CategoryInput }) =>
      API.categories.category_update(requireUid(), id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories })
      Notification.success('Category saved')
    },
    onError: (error) => Notification.error(errorMessage(error)),
  })
}

/**
 * Deletes a category. When it still has expenses pass `moveExpensesTo` — they are moved first
 * (CLAUDE.md §7.3). Without it, the service refuses with `category/has-expenses`.
 */
export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, moveExpensesTo }: { id: string; moveExpensesTo?: string }) => {
      const uid = requireUid()
      if (moveExpensesTo) await API.expenses.expense_reassignCategory(uid, id, moveExpensesTo)
      // Past spending records follow the expenses, or become "All categories" — never lost.
      await API.pastRecords.pastRecord_reassignCategory(uid, id, moveExpensesTo ?? null)
      await API.categories.category_delete(uid, id)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories })
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.expensesRoot }) // expenses may have moved
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pastRecords })
      Notification.success('Category deleted')
    },
    onError: (error) => Notification.error(errorMessage(error)),
  })
}
