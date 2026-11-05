import { format, startOfDay } from 'date-fns'
import type { Expense } from '@/types/expense'
import type { PeriodKey } from '@/types/period'
import type { PreviousPeriod } from './period'

/** Totals, grouping, filtering and comparison text. Pure functions, all money in cents. */

export const sumCents = (items: readonly Pick<Expense, 'amountCents'>[]): number =>
  items.reduce((total, item) => total + item.amountCents, 0)

export type CategoryTotal = {
  categoryId: string
  cents: number
  count: number
  /** Share of the total, rounded to a whole percent (0–100). */
  percent: number
}

/** Spending per category, biggest first. Categories with no spending are not listed. */
export const totalsByCategory = (expenses: readonly Expense[]): CategoryTotal[] => {
  const map = new Map<string, { cents: number; count: number }>()
  for (const e of expenses) {
    const entry = map.get(e.categoryId) ?? { cents: 0, count: 0 }
    entry.cents += e.amountCents
    entry.count += 1
    map.set(e.categoryId, entry)
  }
  const total = sumCents(expenses)
  return [...map.entries()]
    .map(([categoryId, { cents, count }]) => ({
      categoryId,
      cents,
      count,
      percent: total > 0 ? Math.round((cents / total) * 100) : 0,
    }))
    .sort((a, b) => b.cents - a.cents || a.categoryId.localeCompare(b.categoryId))
}

export type DayGroup = {
  /** 'yyyy-MM-dd' */
  key: string
  /** Local midnight of the day. */
  date: Date
  totalCents: number
  /** Newest first. */
  items: Expense[]
}

/** Groups expenses by local day, newest day first (mobile list, M2). */
export const groupByDay = (expenses: readonly Expense[]): DayGroup[] => {
  const groups = new Map<string, DayGroup>()
  for (const e of expenses) {
    const key = format(e.spentAt, 'yyyy-MM-dd')
    let group = groups.get(key)
    if (!group) {
      group = { key, date: startOfDay(e.spentAt), totalCents: 0, items: [] }
      groups.set(key, group)
    }
    group.items.push(e)
    group.totalCents += e.amountCents
  }
  const result = [...groups.values()]
  for (const g of result) g.items.sort((a, b) => b.spentAt.getTime() - a.spentAt.getTime())
  return result.sort((a, b) => b.date.getTime() - a.date.getTime())
}

export type ExpenseFilter = {
  /** Matches the note, case-insensitive. */
  query?: string
  /** Only this category. Empty / undefined / 'all' = every category. */
  categoryId?: string
}

export const filterExpenses = (expenses: readonly Expense[], { query, categoryId }: ExpenseFilter): Expense[] => {
  const q = query?.trim().toLowerCase()
  const byCategory = categoryId && categoryId !== 'all' ? categoryId : undefined
  return expenses.filter(
    (e) => (!byCategory || e.categoryId === byCategory) && (!q || e.note.toLowerCase().includes(q)),
  )
}

// ---------------------------- Comparison ("12% less than last week") --------------------------

export type Comparison = {
  direction: 'less' | 'more' | 'same' | 'none'
  /** Whole percent difference (always ≥ 0). */
  percent: number
  text: string
}

export type CompareInput = {
  currentCents: number
  previousCents: number
  period: PeriodKey
  previous: PreviousPeriod
  /** Days in the current range (used by the custom Range text). */
  rangeDays: number
}

export const compareTotals = ({ currentCents, previousCents, period, previous, rangeDays }: CompareInput): Comparison => {
  if (period === 'range') {
    return { direction: 'none', percent: 0, text: `Custom range · ${rangeDays} ${rangeDays === 1 ? 'day' : 'days'}` }
  }

  const suffix = period === 'year' && previous.partial ? ' so far' : ''

  if (previousCents === 0) {
    return { direction: 'none', percent: 0, text: `No data for ${previous.name} to compare` }
  }

  const percent = Math.round((Math.abs(currentCents - previousCents) / previousCents) * 100)
  if (percent === 0) return { direction: 'same', percent: 0, text: `Same as ${previous.name}${suffix}` }

  const direction = currentCents < previousCents ? 'less' : 'more'
  return { direction, percent, text: `${percent}% ${direction} than ${previous.name}${suffix}` }
}
