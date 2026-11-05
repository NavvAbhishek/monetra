import type { Expense } from '@/types/expense'
import type { DateRange } from '@/types/period'

/**
 * Pure helpers for optimistic updates: patch a cached expense LIST for one date range.
 * The real data replaces this guess when the query is refetched after the mutation.
 */

const newestFirst = (a: Expense, b: Expense) => b.spentAt.getTime() - a.spentAt.getTime()

const inRange = (expense: Expense, range: DateRange) => expense.spentAt >= range.start && expense.spentAt < range.end

/** Adds or replaces `expense`; drops it if it falls outside `range` (e.g. its date was edited). */
export const upsertInList = (list: readonly Expense[], expense: Expense, range: DateRange): Expense[] => {
  const without = list.filter((e) => e.id !== expense.id)
  return (inRange(expense, range) ? [...without, expense] : without).sort(newestFirst)
}

export const removeFromList = (list: readonly Expense[], id: string): Expense[] => list.filter((e) => e.id !== id)
