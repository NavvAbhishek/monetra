import type { Expense } from '@/types/expense'
import { compareTotals, filterExpenses, groupByDay, sumCents, totalsByCategory } from './aggregate'
import { getPeriodRange, getPreviousPeriod } from './period'

const NOW = new Date(2026, 10, 26, 14, 30)
let n = 0
const exp = (categoryId: string, amountCents: number, spentAt: Date, note = ''): Expense => ({
  id: `e${++n}`,
  categoryId,
  amountCents,
  spentAt,
  note,
  createdAt: spentAt,
  updatedAt: spentAt,
})

// The design's week (D2): 9 entries, $194.50
const WEEK: Expense[] = [
  exp('food', 2450, new Date(2026, 10, 26, 13, 10), 'Lunch with Ana'),
  exp('transport', 1830, new Date(2026, 10, 26, 8, 30), 'Bus pass top-up'),
  exp('groceries', 4620, new Date(2026, 10, 25, 18), 'Weekly groceries'),
  exp('fun', 1480, new Date(2026, 10, 25, 20, 15), 'Cinema tickets'),
  exp('bills', 3810, new Date(2026, 10, 24, 9), 'Electricity bill'),
  exp('health', 1240, new Date(2026, 10, 24, 12, 40), 'Pharmacy'),
  exp('food', 200, new Date(2026, 10, 24, 8, 5), 'Morning coffee'),
  exp('groceries', 2170, new Date(2026, 10, 23, 11), 'Farmers market'),
  exp('food', 1650, new Date(2026, 10, 23, 19, 30), 'Dinner out'),
]

describe('sumCents', () => {
  it('adds amounts', () => {
    expect(sumCents(WEEK)).toBe(19450) // $194.50
    expect(sumCents([])).toBe(0)
  })
})

describe('totalsByCategory', () => {
  const totals = totalsByCategory(WEEK)

  it('sorts biggest first with counts', () => {
    expect(totals.map((t) => t.categoryId)).toEqual(['groceries', 'food', 'bills', 'transport', 'fun', 'health'])
    expect(totals[0]).toMatchObject({ categoryId: 'groceries', cents: 6790, count: 2 }) // $67.90 like D6
    expect(totals.find((t) => t.categoryId === 'food')).toMatchObject({ cents: 4300, count: 3 }) // $43.00 like D6
  })

  it('percentages are whole numbers of the total', () => {
    expect(totals[0].percent).toBe(35)
    expect(totals.reduce((s, t) => s + t.percent, 0)).toBeGreaterThanOrEqual(98)
  })

  it('handles no expenses', () => {
    expect(totalsByCategory([])).toEqual([])
  })
})

describe('groupByDay', () => {
  const groups = groupByDay(WEEK)

  it('groups newest day first with day totals', () => {
    expect(groups.map((g) => g.key)).toEqual(['2026-11-26', '2026-11-25', '2026-11-24', '2026-11-23'])
    expect(groups[0].totalCents).toBe(4280) // $42.80 in M2
  })

  it('orders items inside a day newest first', () => {
    expect(groups[0].items.map((e) => e.note)).toEqual(['Lunch with Ana', 'Bus pass top-up'])
  })

  it('returns an empty list for no expenses', () => {
    expect(groupByDay([])).toEqual([])
  })
})

describe('filterExpenses', () => {
  it('searches notes case-insensitively', () => {
    expect(filterExpenses(WEEK, { query: 'LUNCH' })).toHaveLength(1)
    expect(filterExpenses(WEEK, { query: '  dinner ' })).toHaveLength(1)
    expect(filterExpenses(WEEK, { query: 'zzz' })).toHaveLength(0)
  })

  it('filters by category; "all" and empty mean everything', () => {
    expect(filterExpenses(WEEK, { categoryId: 'food' })).toHaveLength(3)
    expect(filterExpenses(WEEK, { categoryId: 'all' })).toHaveLength(9)
    expect(filterExpenses(WEEK, {})).toHaveLength(9)
  })

  it('combines both', () => {
    expect(filterExpenses(WEEK, { categoryId: 'food', query: 'coffee' })).toHaveLength(1)
  })
})

describe('compareTotals', () => {
  const previousOf = (period: 'day' | 'week' | 'month' | 'year' | 'range') =>
    getPreviousPeriod(period, getPeriodRange(period, NOW, { start: '2026-11-02', end: '2026-11-26' }), NOW)
  const compare = (period: 'day' | 'week' | 'month' | 'year' | 'range', currentCents: number, previousCents: number) =>
    compareTotals({ currentCents, previousCents, period, previous: previousOf(period), rangeDays: 25 })

  it('less / more with a rounded percent', () => {
    expect(compare('day', 920, 1000)).toEqual({ direction: 'less', percent: 8, text: '8% less than yesterday' })
    expect(compare('week', 8800, 10000)).toMatchObject({ direction: 'less', text: '12% less than last week' })
    expect(compare('month', 10600, 10000)).toMatchObject({ direction: 'more', text: '6% more than October' })
  })

  it('year says "so far" while the year is in progress', () => {
    expect(compare('year', 9600, 10000).text).toBe('4% less than 2025 so far')
  })

  it('same', () => {
    expect(compare('week', 5000, 5000)).toMatchObject({ direction: 'same', text: 'Same as last week' })
    expect(compare('week', 5001, 5000).direction).toBe('same') // rounds to 0%
  })

  it('no previous data', () => {
    expect(compare('week', 5000, 0)).toEqual({
      direction: 'none',
      percent: 0,
      text: 'No data for last week to compare',
    })
  })

  it('custom range shows the length instead of a comparison', () => {
    expect(compare('range', 5000, 9000).text).toBe('Custom range · 25 days')
    expect(
      compareTotals({ currentCents: 1, previousCents: 1, period: 'range', previous: previousOf('range'), rangeDays: 1 }).text,
    ).toBe('Custom range · 1 day')
  })
})
