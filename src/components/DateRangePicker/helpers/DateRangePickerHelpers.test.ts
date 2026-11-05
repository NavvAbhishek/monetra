import { countDays, getDayState, getMonthGrid, getPresetRange, matchPreset } from './DateRangePickerHelpers'

const NOW = new Date(2026, 10, 26, 14, 30) // Thu, Nov 26 2026
const d = (m: number, day: number, y = 2026) => new Date(y, m - 1, day)

describe('getPresetRange', () => {
  it.each([
    ['last7', d(11, 20), d(11, 26)],
    ['last30', d(10, 28), d(11, 26)],
    ['thisMonth', d(11, 1), d(11, 26)],
    ['lastMonth', d(10, 1), d(10, 31)],
    ['thisYear', d(1, 1), d(11, 26)],
  ] as const)('%s', (key, start, end) => {
    expect(getPresetRange(key, NOW)).toEqual({ start, end })
  })

  it('last month across a year boundary', () => {
    expect(getPresetRange('lastMonth', new Date(2027, 0, 10))).toEqual({ start: d(12, 1), end: d(12, 31) })
  })
})

describe('matchPreset', () => {
  it('recognises a preset range, otherwise custom', () => {
    expect(matchPreset({ start: d(11, 20), end: d(11, 26) }, NOW)).toBe('last7')
    expect(matchPreset({ start: d(11, 2), end: d(11, 26) }, NOW)).toBe('custom')
    expect(matchPreset({ start: d(11, 20), end: null }, NOW)).toBe('custom')
  })
})

describe('getMonthGrid', () => {
  it('November 2026 starts on a Sunday and fills 5 weeks (like the design)', () => {
    const cells = getMonthGrid(d(11, 15))
    expect(cells).toHaveLength(35)
    expect(cells[0]).toEqual(d(11, 1))
    expect(cells[29]).toEqual(d(11, 30))
    expect(cells.slice(30).every((c) => c === null)).toBe(true)
  })

  it('pads the start for months not starting on Sunday', () => {
    const cells = getMonthGrid(d(10, 1)) // Oct 1 2026 is a Thursday
    expect(cells.slice(0, 4)).toEqual([null, null, null, null])
    expect(cells[4]).toEqual(d(10, 1))
    expect(cells.length % 7).toBe(0)
  })
})

describe('getDayState / countDays', () => {
  const range = { start: d(11, 2), end: d(11, 26) }
  const today = d(11, 26)

  it('marks ends, the inside, the future and today', () => {
    expect(getDayState(d(11, 2), range, today)).toMatchObject({ isStart: true, isEnd: false, isBetween: false })
    expect(getDayState(d(11, 10), range, today)).toMatchObject({ isBetween: true })
    expect(getDayState(d(11, 26), range, today)).toMatchObject({ isEnd: true, isToday: true, isBetween: false })
    expect(getDayState(d(11, 27), range, today)).toMatchObject({ isFuture: true, isBetween: false })
  })

  it('no inside while only the start is picked', () => {
    expect(getDayState(d(11, 10), { start: d(11, 2), end: null }, today).isBetween).toBe(false)
  })

  it('counts both ends', () => {
    expect(countDays(d(11, 2), d(11, 26))).toBe(25)
    expect(countDays(d(11, 2), d(11, 2))).toBe(1)
  })
})
