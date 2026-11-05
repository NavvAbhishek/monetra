import { act, renderHook } from '@testing-library/react'
import { addDays, format, startOfDay } from 'date-fns'
import { useDateRangePicker } from './useDateRangePicker'

const iso = (date: Date) => format(date, 'yyyy-MM-dd')
const today = startOfDay(new Date())

describe('useDateRangePicker', () => {
  const initial = { start: iso(addDays(today, -6)), end: iso(today) }

  it('starts from the given range and recognises the preset', () => {
    const { result } = renderHook(() => useDateRangePicker(initial))
    expect(result.current.preset).toBe('last7')
    expect(result.current.dayCount).toBe(7)
    expect(result.current.result).toEqual(initial)
    expect(result.current.canGoNext).toBe(false) // already on the current month
  })

  it('two clicks pick a range; a backwards second click is swapped', () => {
    const { result } = renderHook(() => useDateRangePicker(initial))
    act(() => result.current.selectDay(addDays(today, -3)))
    expect(result.current.result).toBeNull() // waiting for the end
    expect(result.current.preset).toBe('custom')
    act(() => result.current.selectDay(addDays(today, -10)))
    expect(result.current.result).toEqual({ start: iso(addDays(today, -10)), end: iso(addDays(today, -3)) })
    expect(result.current.dayCount).toBe(8)
  })

  it('a third click starts a new range', () => {
    const { result } = renderHook(() => useDateRangePicker(initial))
    act(() => result.current.selectDay(addDays(today, -2)))
    act(() => result.current.selectDay(addDays(today, -1)))
    act(() => result.current.selectDay(addDays(today, -5)))
    expect(result.current.draft.end).toBeNull()
    expect(result.current.draft.start).toEqual(addDays(today, -5))
  })

  it('presets set the range and show its month', () => {
    const { result } = renderHook(() => useDateRangePicker(initial))
    act(() => result.current.choosePreset('lastMonth'))
    expect(result.current.preset).toBe('lastMonth')
    expect(result.current.month.getMonth()).toBe((today.getMonth() + 11) % 12)
    expect(result.current.canGoNext).toBe(true)
    act(() => result.current.nextMonth())
    expect(result.current.canGoNext).toBe(false)
  })
})
