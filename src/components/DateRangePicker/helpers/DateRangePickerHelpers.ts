import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  endOfMonth,
  getDaysInMonth,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfYear,
} from 'date-fns'

/** Picked days are INCLUSIVE at both ends (what the user sees highlighted). */
export type DraftRange = { start: Date; end: Date | null }

export type PresetKey = 'last7' | 'last30' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'custom'

export const PRESETS: readonly { key: PresetKey; label: string }[] = [
  { key: 'last7', label: 'Last 7 days' },
  { key: 'last30', label: 'Last 30 days' },
  { key: 'thisMonth', label: 'This month' },
  { key: 'lastMonth', label: 'Last month' },
  { key: 'thisYear', label: 'This year' },
  { key: 'custom', label: 'Custom' },
]

/** Inclusive start / end for a preset. `custom` has no range of its own. */
export const getPresetRange = (key: Exclude<PresetKey, 'custom'>, now: Date): { start: Date; end: Date } => {
  const today = startOfDay(now)
  switch (key) {
    case 'last7':
      return { start: addDays(today, -6), end: today }
    case 'last30':
      return { start: addDays(today, -29), end: today }
    case 'thisMonth':
      return { start: startOfMonth(today), end: today }
    case 'lastMonth': {
      const start = startOfMonth(addMonths(today, -1))
      return { start, end: startOfDay(endOfMonth(start)) }
    }
    case 'thisYear':
      return { start: startOfYear(today), end: today }
  }
}

/** Which preset (if any) a range matches — otherwise "custom". */
export const matchPreset = (range: DraftRange, now: Date): PresetKey => {
  if (!range.end) return 'custom'
  for (const { key } of PRESETS) {
    if (key === 'custom') continue
    const p = getPresetRange(key, now)
    if (isSameDay(p.start, range.start) && isSameDay(p.end, range.end)) return key
  }
  return 'custom'
}

/** Calendar cells for a month, Sunday first (CLAUDE.md §7.1). `null` = empty cell. Always whole weeks. */
export const getMonthGrid = (month: Date): (Date | null)[] => {
  const first = startOfMonth(month)
  const cells: (Date | null)[] = Array.from({ length: first.getDay() }, () => null)
  for (let d = 0; d < getDaysInMonth(first); d++) cells.push(addDays(first, d))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const

export type DayState = {
  isStart: boolean
  isEnd: boolean
  /** Strictly between start and end. */
  isBetween: boolean
  isFuture: boolean
  isToday: boolean
}

export const getDayState = (day: Date, range: DraftRange, today: Date): DayState => {
  const isStart = isSameDay(day, range.start)
  const isEnd = !!range.end && isSameDay(day, range.end)
  return {
    isStart,
    isEnd,
    isBetween: !!range.end && day > range.start && day < range.end && !isEnd,
    isFuture: day > today,
    isToday: isSameDay(day, today),
  }
}

/** Number of days, both ends included. */
export const countDays = (start: Date, end: Date): number => differenceInCalendarDays(end, start) + 1
