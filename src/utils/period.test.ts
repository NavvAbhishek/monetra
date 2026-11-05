import {
  bucketTotals,
  customRangeToDateRange,
  dateRangeToIso,
  formatDayHeading,
  formatRangeLabel,
  getBucketProgress,
  getBuckets,
  getPeriodRange,
  getPeriodSubtitle,
  getPreviousPeriod,
  getRangeDays,
  isInRange,
  shiftAnchor,
} from './period'

// Thu, Nov 26 2026 14:30 — the date used throughout the design
const NOW = new Date(2026, 10, 26, 14, 30)
const d = (y: number, m: number, day: number, h = 0, min = 0) => new Date(y, m - 1, day, h, min)

describe('getPeriodRange', () => {
  it('day: today 00:00 → tomorrow 00:00', () => {
    expect(getPeriodRange('day', NOW)).toEqual({ start: d(2026, 11, 26), end: d(2026, 11, 27) })
  })

  it('week: Monday → next Monday', () => {
    expect(getPeriodRange('week', NOW)).toEqual({ start: d(2026, 11, 23), end: d(2026, 11, 30) })
    // Sunday still belongs to the week that started on Monday
    expect(getPeriodRange('week', d(2026, 11, 29, 23, 59)).start).toEqual(d(2026, 11, 23))
    expect(getPeriodRange('week', d(2026, 11, 30)).start).toEqual(d(2026, 11, 30))
  })

  it('month and year', () => {
    expect(getPeriodRange('month', NOW)).toEqual({ start: d(2026, 11, 1), end: d(2026, 12, 1) })
    expect(getPeriodRange('year', NOW)).toEqual({ start: d(2026, 1, 1), end: d(2027, 1, 1) })
  })

  it('range: uses the custom range with an inclusive last day', () => {
    const range = getPeriodRange('range', NOW, { start: '2026-11-02', end: '2026-11-26' })
    expect(range).toEqual({ start: d(2026, 11, 2), end: d(2026, 11, 27) })
    expect(getRangeDays(range)).toBe(25) // "25 days" in the design
  })

  it('range: falls back to the last 7 days', () => {
    const range = getPeriodRange('range', NOW)
    expect(range).toEqual({ start: d(2026, 11, 20), end: d(2026, 11, 27) })
    expect(getRangeDays(range)).toBe(7)
  })
})

describe('custom range helpers', () => {
  it('swaps reversed ends', () => {
    expect(customRangeToDateRange({ start: '2026-11-26', end: '2026-11-02' })).toEqual({
      start: d(2026, 11, 2),
      end: d(2026, 11, 27),
    })
  })

  it('round-trips through ISO', () => {
    const iso = { start: '2026-11-02', end: '2026-11-26' }
    expect(dateRangeToIso(customRangeToDateRange(iso))).toEqual(iso)
  })

  it('isInRange is start-inclusive and end-exclusive', () => {
    const range = getPeriodRange('day', NOW)
    expect(isInRange(d(2026, 11, 26), range)).toBe(true)
    expect(isInRange(d(2026, 11, 26, 23, 59), range)).toBe(true)
    expect(isInRange(d(2026, 11, 27), range)).toBe(false)
    expect(isInRange(d(2026, 11, 25, 23, 59), range)).toBe(false)
  })
})

describe('shiftAnchor', () => {
  it('moves by one period', () => {
    expect(shiftAnchor('day', NOW, -1)).toEqual(d(2026, 11, 25, 14, 30))
    expect(shiftAnchor('week', NOW, 1)).toEqual(d(2026, 12, 3, 14, 30))
    expect(shiftAnchor('month', d(2026, 1, 31), 1).getMonth()).toBe(1) // Jan 31 → Feb (clamped)
    expect(shiftAnchor('year', NOW, -1).getFullYear()).toBe(2025)
  })

  it('does not move a custom range', () => {
    expect(shiftAnchor('range', NOW, 1)).toBe(NOW)
  })
})

describe('getPreviousPeriod', () => {
  it('day → yesterday (full day)', () => {
    const prev = getPreviousPeriod('day', getPeriodRange('day', NOW), NOW)
    expect(prev).toEqual({ range: { start: d(2026, 11, 25), end: d(2026, 11, 26) }, name: 'yesterday', partial: false })
  })

  it('week in progress → same elapsed days of last week', () => {
    // Thu = 4th day of the week → Mon–Thu of last week
    const prev = getPreviousPeriod('week', getPeriodRange('week', NOW), NOW)
    expect(prev.range).toEqual({ start: d(2026, 11, 16), end: d(2026, 11, 20) })
    expect(prev.name).toBe('last week')
    expect(prev.partial).toBe(true)
  })

  it('month in progress → Oct 1–26', () => {
    const prev = getPreviousPeriod('month', getPeriodRange('month', NOW), NOW)
    expect(prev.range).toEqual({ start: d(2026, 10, 1), end: d(2026, 10, 27) })
    expect(prev.name).toBe('October')
  })

  it('finished month → full previous month, not partial', () => {
    const october = getPeriodRange('month', d(2026, 10, 15))
    const prev = getPreviousPeriod('month', october, NOW)
    expect(prev.range).toEqual({ start: d(2026, 9, 1), end: d(2026, 10, 1) })
    expect(prev.partial).toBe(false)
  })

  it('does not cut a shorter previous month short wrongly', () => {
    // Mar 31 vs February (28 days): 31 elapsed days > 28 → full February
    const now = d(2026, 3, 31, 12)
    const prev = getPreviousPeriod('month', getPeriodRange('month', now), now)
    expect(prev.range).toEqual({ start: d(2026, 2, 1), end: d(2026, 3, 1) })
    expect(prev.partial).toBe(false)
  })

  it('year in progress → same days of 2025, named "2025"', () => {
    const prev = getPreviousPeriod('year', getPeriodRange('year', NOW), NOW)
    expect(prev.name).toBe('2025')
    expect(prev.partial).toBe(true)
    expect(prev.range.start).toEqual(d(2025, 1, 1))
    expect(prev.range.end).toEqual(d(2025, 11, 27)) // Nov 26 is day 330
  })

  it('range → the equal-length range right before', () => {
    const range = getPeriodRange('range', NOW, { start: '2026-11-02', end: '2026-11-26' })
    const prev = getPreviousPeriod('range', range, NOW)
    expect(prev.range).toEqual({ start: d(2026, 10, 8), end: d(2026, 11, 2) })
    expect(getRangeDays(prev.range)).toBe(25)
  })

  it('names an older week by its start date', () => {
    const older = getPeriodRange('week', d(2026, 11, 2))
    expect(getPreviousPeriod('week', older, NOW).name).toBe('the week of Oct 26')
  })
})

describe('getBuckets', () => {
  it('day: six 3-hour buckets, first one covers 00:00–09:00', () => {
    const buckets = getBuckets('day', getPeriodRange('day', NOW))
    expect(buckets.map((b) => b.label)).toEqual(['6a', '9a', '12p', '3p', '6p', '9p'])
    expect(buckets[0].start).toEqual(d(2026, 11, 26, 0))
    expect(buckets[0].end).toEqual(d(2026, 11, 26, 9))
    expect(buckets[5].end).toEqual(d(2026, 11, 27))
  })

  it('week: Mon … Sun', () => {
    const buckets = getBuckets('week', getPeriodRange('week', NOW))
    expect(buckets.map((b) => b.label)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
  })

  it('month: 7-day chunks W1…W5, last chunk is short', () => {
    const buckets = getBuckets('month', getPeriodRange('month', NOW))
    expect(buckets.map((b) => b.label)).toEqual(['W1', 'W2', 'W3', 'W4', 'W5'])
    expect(buckets[4].start).toEqual(d(2026, 11, 29))
    expect(buckets[4].end).toEqual(d(2026, 12, 1))
  })

  it('month: February 2026 has 4 buckets', () => {
    expect(getBuckets('month', getPeriodRange('month', d(2026, 2, 10)))).toHaveLength(4)
  })

  it('year: J F M A M J J A S O N D', () => {
    const labels = getBuckets('year', getPeriodRange('year', NOW)).map((b) => b.label)
    expect(labels.join('')).toBe('JFMAMJJASOND')
  })

  it('range: 25 days → 9 buckets labelled with the day of the month, like the design', () => {
    const range = getPeriodRange('range', NOW, { start: '2026-11-02', end: '2026-11-26' })
    const buckets = getBuckets('range', range)
    expect(buckets).toHaveLength(9)
    expect(buckets[0].label).toBe('2')
    expect(buckets[0].start).toEqual(range.start)
    expect(buckets.at(-1)?.end).toEqual(range.end)
  })

  it('range: short ranges get one bucket per day', () => {
    const range = getPeriodRange('range', NOW, { start: '2026-11-24', end: '2026-11-26' })
    expect(getBuckets('range', range).map((b) => b.label)).toEqual(['24', '25', '26'])
  })

  it('range: long ranges are labelled "MMM d"', () => {
    const range = getPeriodRange('range', NOW, { start: '2026-08-01', end: '2026-11-26' })
    expect(getBuckets('range', range)[0].label).toBe('Aug 1')
  })

  it('buckets are contiguous and cover the whole range', () => {
    const cases = [
      ['day', getPeriodRange('day', NOW)],
      ['week', getPeriodRange('week', NOW)],
      ['month', getPeriodRange('month', NOW)],
      ['year', getPeriodRange('year', NOW)],
      ['range', getPeriodRange('range', NOW, { start: '2026-10-03', end: '2026-11-26' })],
    ] as const
    for (const [period, range] of cases) {
      const buckets = getBuckets(period, range)
      expect(buckets[0].start).toEqual(range.start)
      expect(buckets.at(-1)?.end).toEqual(range.end)
      buckets.slice(1).forEach((b, i) => expect(b.start).toEqual(buckets[i].end))
    }
  })
})

describe('bucketTotals / getBucketProgress', () => {
  const week = getBuckets('week', getPeriodRange('week', NOW))
  const items = [
    { spentAt: d(2026, 11, 23, 8), amountCents: 100 },
    { spentAt: d(2026, 11, 23, 20), amountCents: 250 },
    { spentAt: d(2026, 11, 26, 13), amountCents: 4280 },
    { spentAt: d(2026, 11, 29, 23, 59), amountCents: 5 },
    { spentAt: d(2026, 11, 30, 0, 0), amountCents: 999 }, // next week — ignored
    { spentAt: d(2026, 11, 22, 23, 59), amountCents: 999 }, // last week — ignored
  ]

  it('sums into the right buckets and ignores out-of-range items', () => {
    expect(bucketTotals(week, items)).toEqual([350, 0, 0, 4280, 0, 0, 5])
  })

  it('finds the current bucket', () => {
    expect(getBucketProgress(week, NOW)).toEqual({ currentIndex: 3, elapsedCount: 4 })
  })

  it('past period: no current bucket, all elapsed', () => {
    expect(getBucketProgress(week, d(2026, 12, 10))).toEqual({ currentIndex: null, elapsedCount: 7 })
  })

  it('future period: nothing elapsed', () => {
    expect(getBucketProgress(week, d(2026, 11, 1))).toEqual({ currentIndex: null, elapsedCount: 0 })
  })
})

describe('labels', () => {
  it('formatRangeLabel', () => {
    expect(formatRangeLabel(d(2026, 11, 26), d(2026, 11, 26))).toBe('Nov 26')
    expect(formatRangeLabel(d(2026, 11, 23), d(2026, 11, 29))).toBe('Nov 23 – 29')
    expect(formatRangeLabel(d(2026, 11, 28), d(2026, 12, 3))).toBe('Nov 28 – Dec 3')
    expect(formatRangeLabel(d(2026, 12, 28), d(2027, 1, 3))).toBe('Dec 28, 2026 – Jan 3, 2027')
  })

  it('getPeriodSubtitle matches the design', () => {
    const sub = (p: Parameters<typeof getPeriodRange>[0]) => getPeriodSubtitle(p, getPeriodRange(p, NOW), NOW)
    expect(sub('day')).toBe('Thu, Nov 26')
    expect(sub('week')).toBe('Nov 23 – 29')
    expect(sub('month')).toBe('November')
    expect(sub('year')).toBe('2026')
    expect(
      getPeriodSubtitle('range', getPeriodRange('range', NOW, { start: '2026-11-02', end: '2026-11-26' }), NOW),
    ).toBe('Nov 2 – 26')
  })

  it('month subtitle adds the year for other years', () => {
    expect(getPeriodSubtitle('month', getPeriodRange('month', d(2025, 10, 5)), NOW)).toBe('October 2025')
  })

  it('formatDayHeading', () => {
    expect(formatDayHeading(d(2026, 11, 26), NOW)).toBe('Today · Thu, Nov 26')
    expect(formatDayHeading(d(2026, 11, 25), NOW)).toBe('Wed, Nov 25')
  })
})
