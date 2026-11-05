import type { Query, QueryKey } from '@tanstack/react-query'
import type { DateRange } from '@/types/period'

/**
 * Every query key lives here (CLAUDE.md §9). The cache is cleared on sign-out, so keys
 * don't need the user id.
 */
export const QUERY_KEYS = {
  profile: ['profile'] as const,
  categories: ['categories'] as const,
  /** Prefix for every expenses query — use it to invalidate or patch them all. */
  expensesRoot: ['expenses'] as const,
  expenses: (range: DateRange) =>
    ['expenses', { start: range.start.toISOString(), end: range.end.toISOString() }] as const,
  expense: (id: string) => ['expenses', 'detail', id] as const,
  /** All-time tracked totals (Past spending page). Under 'expenses' so every expense change refreshes it. */
  expenseTotals: ['expenses', 'totals'] as const,
  pastRecords: ['pastRecords'] as const,
  /** Number of expenses using a category (delete dialog). */
  expenseCount: (categoryId: string) => ['expenses', 'count', categoryId] as const,
}

type RangeKey = readonly ['expenses', { start: string; end: string }]

/** True for list queries (`['expenses', {start, end}]`), false for `['expenses','detail',id]`. */
export const isExpenseListKey = (key: QueryKey): key is RangeKey => {
  const part = key[1]
  return key[0] === 'expenses' && typeof part === 'object' && part !== null && 'start' in part && 'end' in part
}

export const isExpenseListQuery = (query: Query): boolean => isExpenseListKey(query.queryKey)

export const rangeFromKey = (key: RangeKey): DateRange => ({
  start: new Date(key[1].start),
  end: new Date(key[1].end),
})
