import { addDays, differenceInCalendarDays, format, startOfDay } from 'date-fns'
import type { Expense } from '@/types/expense'
import type { DateRange } from '@/types/period'

/** Long-run numbers used by the dashboard Insights and the Insights page. All take the merged items (tracked + past spending). */

/** Average days in a month (365.25 / 12) — turns "per day" into "per month" without caring which months the period touches. */
const DAYS_PER_MONTH = 365.25 / 12

/** Total over `days` days → what that is per month on average. */
export const monthlyAverageCents = (totalCents: number, days: number): number =>
  days > 0 ? Math.round(totalCents / (days / DAYS_PER_MONTH)) : 0

/** The calendar month with the most spending, or null when there is none. */
export const highestMonth = (items: readonly Pick<Expense, 'spentAt' | 'amountCents'>[]): { monthStart: Date; cents: number } | null => {
  const byMonth = new Map<string, number>()
  for (const item of items) {
    const key = format(item.spentAt, 'yyyy-MM')
    byMonth.set(key, (byMonth.get(key) ?? 0) + item.amountCents)
  }
  let best: { key: string; cents: number } | null = null
  for (const [key, cents] of byMonth) if (!best || cents > best.cents) best = { key, cents }
  if (!best) return null
  const [year, month] = best.key.split('-').map(Number)
  return { monthStart: new Date(year, month - 1, 1), cents: best.cents }
}

export type Streak = { days: number; from: Date; to: Date }

/** The longest run of days with no spending between the start of the range and today (or its end). */
export const longestNoSpendStreak = (items: readonly Pick<Expense, 'spentAt'>[], range: DateRange, now: Date): Streak | null => {
  const last = new Date(Math.min(addDays(range.end, -1).getTime(), startOfDay(now).getTime()))
  if (last < range.start) return null
  const spendDays = new Set(items.map((i) => format(i.spentAt, 'yyyy-MM-dd')))

  let best: Streak | null = null
  let runStart: Date | null = null
  for (let day = range.start; day <= last; day = addDays(day, 1)) {
    if (spendDays.has(format(day, 'yyyy-MM-dd'))) {
      runStart = null
      continue
    }
    runStart ??= day
    const days = differenceInCalendarDays(day, runStart) + 1
    if (!best || days > best.days) best = { days, from: runStart, to: day }
  }
  return best
}
