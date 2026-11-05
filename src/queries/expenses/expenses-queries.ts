import { keepPreviousData, useQuery } from '@tanstack/react-query'
import API from '@/services'
import type { DateRange } from '@/types/period'
import { QUERY_KEYS } from '../query-keys'
import { useUid } from '../session'

/** Expenses in `[range.start, range.end)`, newest first. Keeps the old list while the next range loads. */
export const useGetExpensesQuery = (range: DateRange) => {
  const uid = useUid()
  return useQuery({
    queryKey: QUERY_KEYS.expenses(range),
    queryFn: () => API.expenses.expense_listInRange(uid as string, range),
    enabled: !!uid,
    placeholderData: keepPreviousData,
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
