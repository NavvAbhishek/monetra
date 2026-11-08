import { useMemo } from 'react'
import { useGetPastRecordsQuery } from '@/queries/past-records/past-records-queries'
import type { DateRange } from '@/types/period'
import { pastRecordsToExpenses } from '@/utils/pastSpending'

const NONE = { items: [], hasEstimates: false } as const

/**
 * The past spending that falls inside `range`, as pseudo-expenses the dashboard / Insights add to the tracked ones
 * (see `pastRecordsToExpenses`). While the records load `isLoading` is true; if they can't be loaded (e.g. rules not deployed)
 * the numbers simply stay tracked-only.
 */
export const usePastItems = (range: DateRange) => {
  const query = useGetPastRecordsQuery()
  const result = useMemo(() => (query.data ? pastRecordsToExpenses(query.data, range) : NONE), [query.data, range])
  return { items: result.items, hasEstimates: result.hasEstimates, isLoading: query.isPending }
}
