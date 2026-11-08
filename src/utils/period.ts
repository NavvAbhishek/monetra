import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarDays,
  format,
  isSameDay,
  isSameYear,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns'
import type { Bucket, DateRange, IsoDateRange, PeriodKey } from '@/types/period'

/**
 * Period maths (CLAUDE.md §7.1). All dates are LOCAL time.
 * Ranges are [start, end) — end is exclusive.
 */

const WEEK_OPTIONS = { weekStartsOn: 1 } as const // Monday
const ISO_DATE = 'yyyy-MM-dd'

// ---------------------------- ISO date helpers --------------------------

export const toIsoDate = (date: Date): string => format(date, ISO_DATE)

export const parseIsoDate = (iso: string): Date => startOfDay(parseISO(iso))

/** Picked custom range (inclusive ends) → DateRange (exclusive end). Swaps reversed ends. */
export const customRangeToDateRange = (custom: IsoDateRange): DateRange => {
  const a = parseIsoDate(custom.start)
  const b = parseIsoDate(custom.end)
  const [start, last] = a <= b ? [a, b] : [b, a]
  return { start, end: addDays(last, 1) }
}

export const dateRangeToIso = (range: DateRange): IsoDateRange => ({
  start: toIsoDate(range.start),
  end: toIsoDate(addDays(range.end, -1)),
})

// ---------------------------- Ranges --------------------------

/** Number of calendar days in a range. */
export const getRangeDays = (range: DateRange): number => differenceInCalendarDays(range.end, range.start)

export const isInRange = (date: Date, range: DateRange): boolean => date >= range.start && date < range.end

/**
 * The range for a period containing `anchor`.
 * `range` without a custom range falls back to the last 7 days ending on `anchor`.
 */
export const getPeriodRange = (period: PeriodKey, anchor: Date, custom?: IsoDateRange | null): DateRange => {
  const day = startOfDay(anchor)
  switch (period) {
    case 'day':
      return { start: day, end: addDays(day, 1) }
    case 'week': {
      const start = startOfWeek(anchor, WEEK_OPTIONS)
      return { start, end: addWeeks(start, 1) }
    }
    case 'month': {
      const start = startOfMonth(anchor)
      return { start, end: addMonths(start, 1) }
    }
    case 'year': {
      const start = startOfYear(anchor)
      return { start, end: addYears(start, 1) }
    }
    case 'range':
      return custom
        ? customRangeToDateRange(custom)
        : { start: addDays(day, -6), end: addDays(day, 1) }
  }
}

/** Moves the anchor one period back (-1) or forward (+1). `range` isn't navigable → unchanged. */
export const shiftAnchor = (period: PeriodKey, anchor: Date, direction: 1 | -1): Date => {
  switch (period) {
    case 'day':
      return addDays(anchor, direction)
    case 'week':
      return addWeeks(anchor, direction)
    case 'month':
      return addMonths(anchor, direction)
    case 'year':
      return addYears(anchor, direction)
    case 'range':
      return anchor
  }
}

// ---------------------------- Previous period (for comparison) --------------------------

export type PreviousPeriod = {
  range: DateRange
  /** Used in the comparison text: "12% less than {name}". */
  name: string
  /** True when the previous range was cut short to match the elapsed part of the current one. */
  partial: boolean
}

/**
 * The period to compare against. For a week / month / year still in progress the previous
 * range is cut to the same number of elapsed days, so "this month so far" is compared with
 * "last month, same days" rather than all of last month.
 */
export const getPreviousPeriod = (period: PeriodKey, range: DateRange, now: Date = new Date()): PreviousPeriod => {
  const today = startOfDay(now)

  if (period === 'range') {
    const days = getRangeDays(range)
    return {
      range: { start: addDays(range.start, -days), end: range.start },
      name: `the previous ${days} days`,
      partial: false,
    }
  }

  const start = shiftAnchor(period, range.start, -1)
  const full: DateRange = { start, end: range.start }

  let end = full.end
  let partial = false
  if (period !== 'day' && isInRange(now, range)) {
    const elapsedDays = differenceInCalendarDays(today, range.start) + 1
    const cut = addDays(full.start, elapsedDays)
    if (cut < full.end) {
      end = cut
      partial = true
    }
  }

  let name: string
  switch (period) {
    case 'day':
      name = isSameDay(start, addDays(today, -1)) ? 'yesterday' : format(start, 'EEE, MMM d')
      break
    case 'week':
      name = isSameDay(start, addWeeks(startOfWeek(today, WEEK_OPTIONS), -1))
        ? 'last week'
        : `the week of ${format(start, 'MMM d')}`
      break
    case 'month':
      name = isSameYear(start, range.start) ? format(start, 'MMMM') : format(start, 'MMMM yyyy')
      break
    case 'year':
      name = format(start, 'yyyy')
      break
  }

  return { range: { start, end }, name, partial }
}

// ---------------------------- Buckets (chart bars) --------------------------

const DAY_BUCKETS = [
  { label: '6a', hour: 0 }, // 00:00–09:00 is counted in the first bucket (CLAUDE.md §7.1)
  { label: '9a', hour: 9 },
  { label: '12p', hour: 12 },
  { label: '3p', hour: 15 },
  { label: '6p', hour: 18 },
  { label: '9p', hour: 21 },
] as const

const MAX_RANGE_BUCKETS = 9

export const getBuckets = (period: PeriodKey, range: DateRange): Bucket[] => {
  switch (period) {
    case 'day': {
      const starts = DAY_BUCKETS.map((b) => {
        const d = new Date(range.start)
        d.setHours(b.hour, 0, 0, 0)
        return d
      })
      return DAY_BUCKETS.map((b, i) => ({
        label: b.label,
        start: starts[i],
        end: starts[i + 1] ?? range.end,
      }))
    }
    case 'week':
      return Array.from({ length: 7 }, (_, i) => {
        const start = addDays(range.start, i)
        return { label: format(start, 'EEE'), start, end: addDays(start, 1) }
      })
    case 'month': {
      const count = Math.ceil(getRangeDays(range) / 7)
      return Array.from({ length: count }, (_, i) => {
        const start = addDays(range.start, i * 7)
        const end = addDays(start, 7)
        return { label: `W${i + 1}`, start, end: end > range.end ? range.end : end }
      })
    }
    case 'year':
      return Array.from({ length: 12 }, (_, i) => {
        const start = addMonths(range.start, i)
        return { label: format(start, 'MMMMM'), start, end: addMonths(start, 1) }
      })
    case 'range': {
      const days = getRangeDays(range)
      const count = Math.max(1, Math.min(MAX_RANGE_BUCKETS, days))
      const longRange = days > 31
      return Array.from({ length: count }, (_, i) => {
        const start = addDays(range.start, Math.floor((i * days) / count))
        const end = i === count - 1 ? range.end : addDays(range.start, Math.floor(((i + 1) * days) / count))
        return { label: format(start, longRange ? 'MMM d' : 'd'), start, end }
      })
    }
  }
}

/**
 * Buckets for the line chart on the purple hero card. Same as `getBuckets`, except the Month tab plots one
 * point per DAY (1…28/29/30/31 — whatever the month has) instead of weekly chunks. The bar chart keeps W1…W5.
 */
export const getChartBuckets = (period: PeriodKey, range: DateRange): Bucket[] => {
  if (period !== 'month') return getBuckets(period, range)
  return Array.from({ length: getRangeDays(range) }, (_, i) => {
    const start = addDays(range.start, i)
    return { label: format(start, 'd'), start, end: addDays(start, 1) }
  })
}

/** Full name of a chart bucket for tooltips: "Sat, Nov 7", "Nov 23 – 29", "November 2026", "9 AM – 12 PM". */
export const getBucketTitle = (period: PeriodKey, bucket: Bucket): string => {
  switch (period) {
    case 'day':
      return `${format(bucket.start, 'h a')} – ${format(bucket.end, 'h a')}`
    case 'year':
      return format(bucket.start, 'MMMM yyyy')
    default: {
      const last = addDays(bucket.end, -1)
      return isSameDay(bucket.start, last) ? format(bucket.start, 'EEE, MMM d') : formatRangeLabel(bucket.start, last)
    }
  }
}

/** Sums `amountCents` of the items falling in each bucket. */
export const bucketTotals = (
  buckets: readonly Bucket[],
  items: readonly { spentAt: Date; amountCents: number }[],
): number[] => {
  const totals = buckets.map(() => 0)
  for (const item of items) {
    const index = buckets.findIndex((b) => item.spentAt >= b.start && item.spentAt < b.end)
    if (index >= 0) totals[index] += item.amountCents
  }
  return totals
}

export type BucketProgress = {
  /** Bucket containing `now`, or null when `now` is outside the range (past / future period). */
  currentIndex: number | null
  /** How many buckets have started — the line chart plots this many points. */
  elapsedCount: number
}

export const getBucketProgress = (buckets: readonly Bucket[], now: Date = new Date()): BucketProgress => {
  const index = buckets.findIndex((b) => now >= b.start && now < b.end)
  return {
    currentIndex: index >= 0 ? index : null,
    elapsedCount: buckets.filter((b) => b.start <= now).length,
  }
}

// ---------------------------- Labels --------------------------

/** "Nov 26", "Nov 23 – 29", "Nov 28 – Dec 3", "Dec 28, 2025 – Jan 3, 2026". `last` is INCLUSIVE. */
export const formatRangeLabel = (first: Date, last: Date): string => {
  if (isSameDay(first, last)) return format(first, 'MMM d')
  if (!isSameYear(first, last)) return `${format(first, 'MMM d, yyyy')} – ${format(last, 'MMM d, yyyy')}`
  if (first.getMonth() === last.getMonth()) return `${format(first, 'MMM d')} – ${format(last, 'd')}`
  return `${format(first, 'MMM d')} – ${format(last, 'MMM d')}`
}

/** Subtitle under the total: "Thu, Nov 26", "Nov 23 – 29", "November", "2026", "Nov 2 – 26". */
export const getPeriodSubtitle = (period: PeriodKey, range: DateRange, now: Date = new Date()): string => {
  switch (period) {
    case 'day':
      return format(range.start, 'EEE, MMM d')
    case 'week':
    case 'range':
      return formatRangeLabel(range.start, addDays(range.end, -1))
    case 'month':
      return isSameYear(range.start, now) ? format(range.start, 'MMMM') : format(range.start, 'MMMM yyyy')
    case 'year':
      return format(range.start, 'yyyy')
  }
}

/** Group heading in the mobile expense list: "Today · Thu, Nov 26" or "Wed, Nov 25". */
export const formatDayHeading = (date: Date, now: Date = new Date()): string => {
  const label = format(date, 'EEE, MMM d')
  return isSameDay(date, now) ? `Today · ${label}` : label
}
