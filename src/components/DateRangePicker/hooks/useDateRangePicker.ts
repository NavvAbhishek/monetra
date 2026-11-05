import { addMonths, startOfDay, startOfMonth } from 'date-fns'
import { useState } from 'react'
import type { IsoDateRange } from '@/types/period'
import { parseIsoDate, toIsoDate } from '@/utils/period'
import { countDays, getPresetRange, matchPreset, type DraftRange, type PresetKey } from '../helpers/DateRangePickerHelpers'

/**
 * Picker state. Click a day to start a new range, click a second day to finish it
 * (if it is before the first, the two are swapped). Future days are not allowed.
 */
export const useDateRangePicker = (initial: IsoDateRange) => {
  const [today] = useState(() => startOfDay(new Date()))
  const [draft, setDraft] = useState<DraftRange>(() => ({ start: parseIsoDate(initial.start), end: parseIsoDate(initial.end) }))
  const [month, setMonth] = useState(() => startOfMonth(parseIsoDate(initial.end)))
  const [preset, setPreset] = useState<PresetKey>(() => matchPreset(draft, today))

  const selectDay = (day: Date) => {
    setPreset('custom')
    setDraft((current) => {
      if (current.end) return { start: day, end: null } // start again
      return day < current.start ? { start: day, end: current.start } : { start: current.start, end: day }
    })
  }

  const choosePreset = (key: PresetKey) => {
    setPreset(key)
    if (key === 'custom') return
    const range = getPresetRange(key, today)
    setDraft(range)
    setMonth(startOfMonth(range.end))
  }

  const thisMonth = startOfMonth(today)

  return {
    today,
    draft,
    month,
    preset,
    selectDay,
    choosePreset,
    previousMonth: () => setMonth((m) => addMonths(m, -1)),
    nextMonth: () => setMonth((m) => addMonths(m, 1)),
    canGoNext: month < thisMonth,
    /** Days in the finished range, or null while only the first day is picked. */
    dayCount: draft.end ? countDays(draft.start, draft.end) : null,
    /** The range to apply, or null until both ends are picked. */
    result: draft.end ? { start: toIsoDate(draft.start), end: toIsoDate(draft.end) } : null,
  }
}

export type DateRangePickerCtx = ReturnType<typeof useDateRangePicker>
