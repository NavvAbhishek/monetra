import type { SegmentedOption } from '@/components/ui/segmented-tabs'
import { addDays, differenceInCalendarDays, startOfDay } from 'date-fns'
import type { Expense } from '@/types/expense'
import type { StackedBar } from '@/components/charts/StackedBarChart'
import type { Category } from '@/types/category'
import type { Bucket, DateRange, PeriodKey } from '@/types/period'
import { getBucketTitle } from '@/utils/period'
import { CATEGORY_COLOUR_COUNT } from '@/constant/categoryColours'
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

/** Heading of the stacked bar card — says what one bar is. */
export const getBarChartTitle = (period: PeriodKey): string =>
  ({ day: 'Spending by time of day', week: 'Spending by day', month: 'Spending by day', year: 'Spending by month', range: 'Spending over time' })[period]

/**
 * One stacked bar per bucket: spending split by category. `categories` is in stacking order
 * (bottom → top), so the biggest category is always the bottom block and colours line up with the donut.
 */
export const buildStackedBars = (
  period: PeriodKey,
  buckets: readonly Bucket[],
  expenses: readonly Expense[],
  categories: readonly Category[],
  tones: ReadonlyMap<string, number>,
): StackedBar[] => {
  const perBucket = buckets.map(() => new Map<string, number>())
  for (const expense of expenses) {
    const index = buckets.findIndex((b) => expense.spentAt >= b.start && expense.spentAt < b.end)
    if (index < 0) continue
    const sums = perBucket[index]
    sums.set(expense.categoryId, (sums.get(expense.categoryId) ?? 0) + expense.amountCents)
  }
  return buckets.map((bucket, i) => {
    const segments = categories.flatMap((c) => {
      const cents = perBucket[i].get(c.id) ?? 0
      return cents > 0 ? [{ id: c.id, name: c.name, emoji: c.emoji, tone: tones.get(c.id) ?? c.colourIndex, cents }] : []
    })
    return {
      label: bucket.label,
      title: getBucketTitle(period, bucket),
      totalCents: segments.reduce((total, s) => total + s.cents, 0),
      segments,
    }
  })
}

/**
 * A colour per category for the charts, so no two slices / bars / meters look the same.
 * The categories come biggest first: each keeps the colour the user picked unless a bigger one already took it;
 * those get a colour nobody has claimed. With more categories than colours (6) the colours repeat.
 * Only the dashboard charts use this — the category itself keeps its own colour everywhere else.
 */
export const assignChartTones = (categories: readonly Pick<Category, 'id' | 'colourIndex'>[]): Map<string, number> => {
  const tones = new Map<string, number>()
  const claimed = new Set<number>()
  const clashing: string[] = []
  for (const c of categories) {
    const own = ((c.colourIndex % CATEGORY_COLOUR_COUNT) + CATEGORY_COLOUR_COUNT) % CATEGORY_COLOUR_COUNT
    if (claimed.has(own)) {
      clashing.push(c.id)
    } else {
      claimed.add(own)
      tones.set(c.id, own)
    }
  }
  const free = Array.from({ length: CATEGORY_COLOUR_COUNT }, (_, i) => i).filter((i) => !claimed.has(i))
  clashing.forEach((id, n) => tones.set(id, free.length > 0 ? free[n % free.length] : n % CATEGORY_COLOUR_COUNT))
  return tones
}
