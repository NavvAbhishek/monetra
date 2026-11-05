import type { SegmentedOption } from '@/components/ui/segmented-tabs'
import type { PeriodKey } from '@/types/period'
import { formatMoney } from '@/utils/money'

export const DASHBOARD_PERIOD_OPTIONS: readonly SegmentedOption<PeriodKey>[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
  { value: 'range', label: 'Range' },
]

/** "Hi Sam 👋" — first word of the name. */
export const getFirstName = (name: string | undefined): string => name?.trim().split(/\s+/)[0] || 'there'

/** Spoken chart summary: "Spending Nov 23 – 29: Mon $38.20, Tue $52.50, …". */
export const describeSeries = (subtitle: string, labels: readonly string[], values: readonly number[], currency: string) =>
  `Spending ${subtitle}: ${labels.map((l, i) => `${l} ${formatMoney(values[i] ?? 0, currency)}`).join(', ')}`

/** Number of recent expenses on the desktop dashboard. */
export const RECENT_COUNT = 5
