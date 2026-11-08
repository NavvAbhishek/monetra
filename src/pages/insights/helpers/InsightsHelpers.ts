import { addDays, differenceInCalendarDays, format, startOfDay } from 'date-fns'
import type { SegmentedOption } from '@/components/ui/segmented-tabs'
import type { Category } from '@/types/category'
import type { Expense } from '@/types/expense'
import type { DateRange, PeriodKey } from '@/types/period'
import { groupByDay, sumCents, totalsByCategory } from '@/utils/aggregate'

/** Insights offers Week / Month / Year with ‹ › stepping (same as the Expenses page). */
export type InsightsPeriod = Extract<PeriodKey, 'week' | 'month' | 'year'>

export const INSIGHTS_PERIOD_OPTIONS: readonly SegmentedOption<InsightsPeriod>[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
]

// ---------------------------- change vs the previous period --------------------------

export type Delta = {
  /** `up` = spent more, `down` = spent less, `new` = nothing before, `none` = nothing in either period. */
  direction: 'up' | 'down' | 'same' | 'new' | 'none'
  /** Whole percent (≥ 0). */
  percent: number
}

export const getDelta = (currentCents: number, previousCents: number): Delta => {
  if (previousCents === 0) return { direction: currentCents === 0 ? 'none' : 'new', percent: 0 }
  const percent = Math.round((Math.abs(currentCents - previousCents) / previousCents) * 100)
  if (percent === 0) return { direction: 'same', percent: 0 }
  return { direction: currentCents > previousCents ? 'up' : 'down', percent }
}

// ---------------------------- summary tiles --------------------------

export type Summary = {
  totalCents: number
  count: number
  /** Days from the start of the period to today (or to its end, for a finished period). */
  days: number
  dailyAverageCents: number
  highestDay: { date: Date; cents: number } | null
  biggest: Expense | null
  activeDays: number
  /** Days so far with no spending at all. */
  noSpendDays: number
}

/** Last day that counts: the end of the period, or today while it is still running. */
const lastCountedDay = (range: DateRange, now: Date): Date =>
  new Date(Math.min(addDays(range.end, -1).getTime(), startOfDay(now).getTime()))

export const buildSummary = (expenses: readonly Expense[], range: DateRange, now: Date): Summary => {
  const days = Math.max(0, differenceInCalendarDays(lastCountedDay(range, now), range.start) + 1)
  const byDay = groupByDay(expenses)
  const totalCents = sumCents(expenses)
  const highest = byDay.reduce<(typeof byDay)[number] | null>((best, g) => (!best || g.totalCents > best.totalCents ? g : best), null)
  const biggest = expenses.reduce<Expense | null>((best, e) => (!best || e.amountCents > best.amountCents ? e : best), null)
  return {
    totalCents,
    count: expenses.length,
    days,
    dailyAverageCents: days > 0 ? Math.round(totalCents / days) : 0,
    highestDay: highest ? { date: highest.date, cents: highest.totalCents } : null,
    biggest,
    activeDays: byDay.length,
    noSpendDays: Math.max(0, days - byDay.length),
  }
}

// ---------------------------- weekday pattern --------------------------

export type WeekdayBar = {
  /** 'Mon' … 'Sun' */
  label: string
  totalCents: number
  /** Average per such weekday so far in the period. */
  averageCents: number
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
const weekdayIndex = (date: Date): number => (date.getDay() + 6) % 7 // Monday = 0

/** Average spending for each weekday (Mon–Sun) over the days of the period that have passed. */
export const buildWeekdayBars = (expenses: readonly Expense[], range: DateRange, now: Date): WeekdayBar[] => {
  const totals = WEEKDAY_LABELS.map(() => 0)
  const dayCounts = WEEKDAY_LABELS.map(() => 0)
  const last = lastCountedDay(range, now)
  for (let day = range.start; day <= last; day = addDays(day, 1)) dayCounts[weekdayIndex(day)] += 1
  for (const e of expenses) totals[weekdayIndex(e.spentAt)] += e.amountCents
  return WEEKDAY_LABELS.map((label, i) => ({
    label,
    totalCents: totals[i],
    averageCents: dayCounts[i] > 0 ? Math.round(totals[i] / dayCounts[i]) : 0,
  }))
}

// ---------------------------- categories vs previous period --------------------------

export type CategoryChange = {
  category: Category
  tone: number
  currentCents: number
  previousCents: number
  delta: Delta
}

/** Every category that has spending now or in the previous period, biggest now first. */
export const buildCategoryChanges = (
  current: readonly Expense[],
  previous: readonly Expense[],
  categoryById: ReadonlyMap<string, Category>,
  tones: ReadonlyMap<string, number>,
): CategoryChange[] => {
  const now = new Map(totalsByCategory(current).map((t) => [t.categoryId, t.cents]))
  const before = new Map(totalsByCategory(previous).map((t) => [t.categoryId, t.cents]))
  const ids = new Set([...now.keys(), ...before.keys()])
  return [...ids]
    .flatMap((id) => {
      const category = categoryById.get(id)
      if (!category) return []
      const currentCents = now.get(id) ?? 0
      const previousCents = before.get(id) ?? 0
      return [{ category, tone: tones.get(id) ?? category.colourIndex, currentCents, previousCents, delta: getDelta(currentCents, previousCents) }]
    })
    .sort((a, b) => b.currentCents - a.currentCents || b.previousCents - a.previousCents)
}

// ---------------------------- top expenses --------------------------

export const getTopExpenses = (expenses: readonly Expense[], limit = 5): Expense[] =>
  [...expenses].sort((a, b) => b.amountCents - a.amountCents || b.spentAt.getTime() - a.spentAt.getTime()).slice(0, limit)

/** "This month" while the period contains today, otherwise its label. */
export const getHeading = (period: InsightsPeriod, isCurrent: boolean, subtitle: string): string =>
  isCurrent ? `This ${period}` : subtitle

export const formatDay = (date: Date): string => format(date, 'EEE, MMM d')
