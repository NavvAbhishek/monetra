import type { SegmentedOption } from '@/components/ui/segmented-tabs'
import { addDays, differenceInCalendarDays, startOfDay } from 'date-fns'
import type { Expense } from '@/types/expense'
import type { DateRange, PeriodKey } from '@/types/period'
import { groupByDay, sumCents } from '@/utils/aggregate'
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

export type Insights = {
  /** Total ÷ days so far in the period. */
  dailyAverageCents: number
  /** Days counted for the average: the whole period, or only the days up to today while it is in progress. */
  days: number
  /** The day with the most spending. */
  highestDay: { date: Date; cents: number } | null
  /** The single largest expense. */
  biggest: Expense | null
  count: number
  /** Number of different days that have at least one expense. */
  activeDays: number
}

/** The stat tiles under "Insights" for the selected period. */
export const buildInsights = (expenses: readonly Expense[], range: DateRange, now: Date): Insights => {
  const lastDay = new Date(Math.min(addDays(range.end, -1).getTime(), startOfDay(now).getTime()))
  const days = Math.max(1, differenceInCalendarDays(lastDay, range.start) + 1)
  const byDay = groupByDay(expenses)
  const highest = byDay.reduce<(typeof byDay)[number] | null>((best, g) => (!best || g.totalCents > best.totalCents ? g : best), null)
  const biggest = expenses.reduce<Expense | null>((best, e) => (!best || e.amountCents > best.amountCents ? e : best), null)

  return {
    dailyAverageCents: Math.round(sumCents(expenses) / days),
    days,
    highestDay: highest ? { date: highest.date, cents: highest.totalCents } : null,
    biggest,
    count: expenses.length,
    activeDays: byDay.length,
  }
}
