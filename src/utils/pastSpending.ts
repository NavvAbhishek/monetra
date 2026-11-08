import { addDays, differenceInCalendarDays, format } from 'date-fns'
import type { Category } from '@/types/category'
import type { Expense } from '@/types/expense'
import type { DateRange } from '@/types/period'
import type { ExpenseTotals, PastRecord } from '@/types/pastRecord'
import { formatRangeLabel, parseIsoDate, toIsoDate } from './period'

/** "March 2026", "2025" or "Jan 2 – Mar 4, 2025". */
export const formatPastPeriod = (r: Pick<PastRecord, 'periodType' | 'start' | 'end'>): string => {
  const start = parseIsoDate(r.start)
  if (r.periodType === 'year') return format(start, 'yyyy')
  if (r.periodType === 'month') return format(start, 'MMMM yyyy')
  const end = parseIsoDate(r.end)
  const label = formatRangeLabel(start, end)
  // formatRangeLabel omits the year when both ends share one — add it, these are often older periods
  return start.getFullYear() === end.getFullYear() ? `${label}, ${start.getFullYear()}` : label
}

/**
 * A past period overlaps the time tracked in Monetra when it reaches the first tracked expense's day:
 * the all-time total may then count that spending twice (CLAUDE.md §7.5 — allowed, but warned).
 */
export const overlapsTracking = (end: string, firstSpentAt: Date | null): boolean =>
  !!firstSpentAt && end >= toIsoDate(firstSpentAt)

export type AllTimeRow = {
  /** category id, or 'unsplit' for past records without a category */
  key: string
  name: string
  emoji: string
  colourIndex: number | null
  pastCents: number
  trackedCents: number
  totalCents: number
  /** whole percent of the all-time total */
  percent: number
}

export type AllTime = {
  pastCents: number
  trackedCents: number
  allTimeCents: number
  rows: AllTimeRow[]
}

/** Past records + tracked totals → the all-time summary and per-category breakdown (biggest first). */
export const buildAllTime = (
  records: readonly PastRecord[],
  totals: ExpenseTotals | undefined,
  categories: readonly Category[],
): AllTime => {
  const pastByKey = new Map<string, number>()
  for (const r of records) {
    const key = r.categoryId ?? 'unsplit'
    pastByKey.set(key, (pastByKey.get(key) ?? 0) + r.amountCents)
  }
  const pastCents = records.reduce((sum, r) => sum + r.amountCents, 0)
  const trackedCents = totals?.totalCents ?? 0
  const allTimeCents = pastCents + trackedCents

  const rows: AllTimeRow[] = categories.map((c) => {
    const past = pastByKey.get(c.id) ?? 0
    const tracked = totals?.byCategory[c.id] ?? 0
    return { key: c.id, name: c.name, emoji: c.emoji, colourIndex: c.colourIndex, pastCents: past, trackedCents: tracked, totalCents: past + tracked, percent: 0 }
  })
  const unsplit = pastByKey.get('unsplit') ?? 0
  if (unsplit > 0) {
    rows.push({ key: 'unsplit', name: 'Not split by category', emoji: '🧾', colourIndex: null, pastCents: unsplit, trackedCents: 0, totalCents: unsplit, percent: 0 })
  }
  return {
    pastCents,
    trackedCents,
    allTimeCents,
    rows: rows
      .filter((r) => r.totalCents > 0)
      .map((r) => ({ ...r, percent: allTimeCents > 0 ? Math.round((r.totalCents / allTimeCents) * 100) : 0 }))
      .sort((a, b) => b.totalCents - a.totalCents),
  }
}

// ---------------------------- past spending inside the dashboard / Insights numbers --------------------------

const PAST_ID_PREFIX = 'past:'

/** Past records without a category (an old app's total) show up as this stand-in category. */
export const UNSPLIT_CATEGORY: Category = {
  id: '__unsplit',
  name: 'Not split by category',
  emoji: '🧾',
  colourIndex: 5,
  order: 9999,
  createdAt: new Date(0),
}

/** Is this item a piece of a past record (not a real tracked expense)? */
export const isPastItem = (e: Pick<Expense, 'id'>): boolean => e.id.startsWith(PAST_ID_PREFIX)

export type PastItems = {
  items: Expense[]
  /** Some record is longer than a day, so its amount was spread evenly over its days (an estimate for shorter views). */
  hasEstimates: boolean
}

/**
 * Turns the part of each past record that falls inside `range` into one pseudo-expense per day, so the dashboard and
 * Insights can add it to the tracked expenses. A record's amount is spread evenly over ALL its days (the remainder cents go
 * to the first days), so a daily record lands exactly on its day, a month record adds roughly a thirtieth per day, and any
 * selected range gets only its share. The items are noon on their day, with ids starting `past:` (see `isPastItem`).
 */
export const pastRecordsToExpenses = (records: readonly PastRecord[], range: DateRange): PastItems => {
  const items: Expense[] = []
  let hasEstimates = false
  const rangeFirst = range.start
  const rangeLast = addDays(range.end, -1)

  for (const record of records) {
    const first = parseIsoDate(record.start)
    const last = parseIsoDate(record.end)
    const from = first > rangeFirst ? first : rangeFirst
    const to = last < rangeLast ? last : rangeLast
    if (from > to) continue

    const days = differenceInCalendarDays(last, first) + 1
    const base = Math.floor(record.amountCents / days)
    const remainder = record.amountCents - base * days
    if (days > 1) hasEstimates = true

    for (let day = from; day <= to; day = addDays(day, 1)) {
      const offset = differenceInCalendarDays(day, first)
      const amountCents = base + (offset < remainder ? 1 : 0)
      if (amountCents <= 0) continue
      items.push({
        id: `${PAST_ID_PREFIX}${record.id}:${toIsoDate(day)}`,
        amountCents,
        categoryId: record.categoryId ?? UNSPLIT_CATEGORY.id,
        spentAt: new Date(day.getFullYear(), day.getMonth(), day.getDate(), 12),
        note: record.note,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      })
    }
  }
  return { items, hasEstimates }
}
