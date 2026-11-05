import type { SegmentedOption } from '@/components/ui/segmented-tabs'
import type { PeriodKey } from '@/types/period'

/** The list page offers Week / Month / Year (the dashboard has Day and Range too). */
export type ListPeriod = Extract<PeriodKey, 'week' | 'month' | 'year'>

export const LIST_PERIOD_OPTIONS: readonly SegmentedOption<ListPeriod>[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
]

export type ExpensesMode = { kind: 'list' } | { kind: 'new' } | { kind: 'edit'; id: string }

/** Which screen the URL asks for: /expenses, /expenses/new or /expenses/$expenseId. */
export const getMode = (pathname: string, expenseId: string | undefined): ExpensesMode => {
  if (pathname.endsWith('/expenses/new')) return { kind: 'new' }
  if (expenseId) return { kind: 'edit', id: expenseId }
  return { kind: 'list' }
}

/** "This week" while the period contains today, otherwise the date label ("Nov 16 – 22"). */
export const getPeriodHeading = (period: ListPeriod, isCurrent: boolean, subtitle: string): string =>
  isCurrent ? `This ${period}` : subtitle

export const UNDO_WINDOW_MS = 5000
