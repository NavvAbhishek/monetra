import { addYears, startOfDay, startOfMonth } from 'date-fns'
import { useState } from 'react'
import type { CalendarCtx } from '@/components/DateRangePicker/components/CalendarMonth'
import { parseIsoDate, toIsoDate } from '@/utils/period'

type Options = {
  /** Selected day, 'yyyy-MM-dd' ('' = none). */
  value: string
  /** Last selectable day, 'yyyy-MM-dd'. No limit when omitted. */
  max?: string
  onPick: (iso: string) => void
}

/** State of the single-date calendar: which month is shown, and the picked day. */
export const useDatePicker = ({ value, max, onPick }: Options) => {
  const [today] = useState(() => startOfDay(new Date()))
  const selected = value ? parseIsoDate(value) : null
  const maxDate = max ? parseIsoDate(max) : addYears(today, 50)
  const [month, setMonth] = useState(() => startOfMonth(selected ?? today))

  // The calendar reuses the range picker's grid: a single day is a range whose two ends are the same day.
  const ctx: CalendarCtx = {
    today,
    month,
    draft: { start: selected ?? new Date(0), end: selected ?? new Date(0) },
    selectDay: (day) => onPick(toIsoDate(day)),
    previousMonth: () => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1)),
    nextMonth: () => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1)),
    canGoNext: month < startOfMonth(maxDate),
  }

  return {
    ctx,
    maxDate,
    selected,
    canPickToday: today <= maxDate,
    pickToday: () => onPick(toIsoDate(today)),
    // reopen on the selected month, not wherever the user browsed to last time
    resetMonth: () => setMonth(startOfMonth(selected ?? today)),
  }
}
