import { type QueryClient, useMutation, useQueryClient } from '@tanstack/react-query'
import API from '@/services'
import type { Expense, ExpenseInput } from '@/types/expense'
import { format } from 'date-fns'
import { downloadCsv, expensesToCsv } from '@/utils/csv'
import { newId } from '@/utils/id'
import { Notification } from '@/utils/notification'
import { isExpenseListQuery, QUERY_KEYS, rangeFromKey, isExpenseListKey } from '../query-keys'
import { errorMessage, requireUid } from '../session'
import { removeFromList, upsertInList } from './expenses-cache'

type Snapshot = [readonly unknown[], Expense[] | undefined][]

/**
 * Optimistic update: runs `patch` over every cached expense list, returns the previous
 * values so `onError` can put them back.
 */
const patchLists = async (
  queryClient: QueryClient,
  patch: (list: Expense[], range: { start: Date; end: Date }) => Expense[],
): Promise<Snapshot> => {
  await queryClient.cancelQueries({ queryKey: QUERY_KEYS.expensesRoot, predicate: isExpenseListQuery })
  const snapshot = queryClient.getQueriesData<Expense[]>({
    queryKey: QUERY_KEYS.expensesRoot,
    predicate: isExpenseListQuery,
  })
  for (const [key, list] of snapshot) {
    if (list && isExpenseListKey(key)) queryClient.setQueryData(key, patch(list, rangeFromKey(key)))
  }
  return snapshot
}

const restore = (queryClient: QueryClient, snapshot: Snapshot | undefined) => {
  snapshot?.forEach(([key, list]) => queryClient.setQueryData(key, list))
}

const refresh = (queryClient: QueryClient) => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.expensesRoot })

export const useCreateExpenseMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ExpenseInput) => API.expenses.expense_create(requireUid(), input),
    onMutate: (input) => {
      const now = new Date()
      const guess: Expense = { id: `optimistic-${newId()}`, ...input, createdAt: now, updatedAt: now }
      return patchLists(queryClient, (list, range) => upsertInList(list, guess, range))
    },
    onError: (error, _input, snapshot) => {
      restore(queryClient, snapshot)
      Notification.error(errorMessage(error))
    },
    onSuccess: () => Notification.success('Expense added'),
    onSettled: () => refresh(queryClient),
  })
}

export const useUpdateExpenseMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ExpenseInput }) =>
      API.expenses.expense_update(requireUid(), id, input),
    onMutate: ({ id, input }) =>
      patchLists(queryClient, (list, range) => {
        const current = list.find((e) => e.id === id)
        // Not in this range's list (e.g. it was moved INTO this range) → add it
        const base: Expense = current ?? { id, ...input, createdAt: new Date(), updatedAt: new Date() }
        return upsertInList(list, { ...base, ...input, updatedAt: new Date() }, range)
      }),
    onError: (error, _vars, snapshot) => {
      restore(queryClient, snapshot)
      Notification.error(errorMessage(error))
    },
    onSuccess: () => Notification.success('Changes saved'),
    onSettled: () => refresh(queryClient),
  })
}

/** Called after the user confirmed in DeleteExpenseDialog (CLAUDE.md §7.3). */
export const useDeleteExpenseMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => API.expenses.expense_delete(requireUid(), id),
    onMutate: (id) => patchLists(queryClient, (list) => removeFromList(list, id)),
    onError: (error, _id, snapshot) => {
      restore(queryClient, snapshot)
      Notification.error(errorMessage(error))
    },
    onSuccess: () => Notification.success('Expense deleted'),
    onSettled: () => refresh(queryClient),
  })
}

/** Every expense, all time — for the CSV export. Reads all documents, so only on demand. */
const ALL_TIME = { start: new Date(2000, 0, 1), end: new Date(2100, 0, 1) }

/** Settings → "Download CSV": all expenses with category names, oldest first. */
export const useExportExpensesMutation = () =>
  useMutation({
    mutationFn: async (currency: string) => {
      const uid = requireUid()
      const [expenses, categories] = await Promise.all([
        API.expenses.expense_listInRange(uid, ALL_TIME),
        API.categories.category_list(uid),
      ])
      downloadCsv(`monetra-expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`, expensesToCsv(expenses, categories, currency))
      return expenses.length
    },
    onSuccess: (count) =>
      count > 0 ? Notification.success(`Exported ${count} expenses`) : Notification.info('No expenses to export yet'),
    onError: (error) => Notification.error(errorMessage(error)),
  })
