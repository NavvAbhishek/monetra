import { keepPreviousData, useQuery } from '@tanstack/react-query'
import API from '@/services'
import type { DateRange } from '@/types/period'
import { QUERY_KEYS } from '../query-keys'
import { useUid } from '../session'

/** Expenses in `[range.start, range.end)`, newest first. Keeps the old list while the next range loads. */
export const useGetExpensesQuery = (range: DateRange, { enabled = true }: { enabled?: boolean } = {}) => {
  const uid = useUid()
  return useQuery({
    queryKey: QUERY_KEYS.expenses(range),
    queryFn: () => API.expenses.expense_listInRange(uid as string, range),
    enabled: !!uid && enabled,
    placeholderData: keepPreviousData,
  })
}

/** How many expenses use a category — the delete dialog asks before moving them. */
export const useGetCategoryExpenseCountQuery = (categoryId: string | undefined, enabled = true) => {
  const uid = useUid()
  return useQuery({
    queryKey: QUERY_KEYS.expenseCount(categoryId ?? ''),
    queryFn: () => API.expenses.expense_countForCategory(uid as string, categoryId as string),
    enabled: !!uid && !!categoryId && enabled,
    staleTime: 0, // always fresh when the dialog opens
  })
}

/** All-time totals of tracked expenses (server-side sums) for the Past spending page. */
export const useGetExpenseTotalsQuery = () => {
  const uid = useUid()
  return useQuery({
    queryKey: QUERY_KEYS.expenseTotals,
    queryFn: () => API.expenses.expense_totals(uid as string),
    enabled: !!uid,
  })
}

/** One expense for the edit form. `id` undefined (new expense) disables the query. */
export const useGetExpenseQuery = (id: string | undefined) => {
  const uid = useUid()
  return useQuery({
    queryKey: QUERY_KEYS.expense(id ?? ''),
    queryFn: () => API.expenses.expense_get(uid as string, id as string),
    enabled: !!uid && !!id,
  })
}
