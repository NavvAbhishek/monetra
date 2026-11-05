import { format } from 'date-fns'
import type { SegmentedOption } from '@/components/ui/segmented-tabs'
import type { PastPeriodType, PastRecord } from '@/types/pastRecord'

export const PERIOD_TYPE_OPTIONS: readonly SegmentedOption<PastPeriodType>[] = [
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
  { value: 'range', label: 'Date range' },
]

export const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1).padStart(2, '0'),
  label: format(new Date(2000, i, 1), 'MMMM'),
}))

/** This year and the 30 before it. */
export const getYearOptions = (now: Date) =>
  Array.from({ length: 31 }, (_, i) => String(now.getFullYear() - i))

export type DialogState = { kind: 'closed' } | { kind: 'new' } | { kind: 'edit'; record: PastRecord }
