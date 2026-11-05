import { buildBarHeights, buildLineChart, CHART_H } from './chart-geometry'

describe('buildLineChart', () => {
  it('plots only the elapsed buckets, spaced over the full width', () => {
    const g = buildLineChart([10, 20, 40, 0, 0], 3)
    // x = i * 300/4 → 0, 75, 150 ; y = 110 - 8 - v/40 * 86
    expect(g.line).toBe('0.0,80.5 75.0,59.0 150.0,16.0')
    expect(g.last).toEqual({ xPct: 50, yPct: (16 / CHART_H) * 100 })
  })

  it('closes the area down to the bottom edge', () => {
    const g = buildLineChart([5, 5], 2)
    expect(g.area.startsWith('M0,110 L')).toBe(true)
    expect(g.area.endsWith('L300.0,110 Z')).toBe(true)
  })

  it('draws a flat line along the bottom when everything is zero', () => {
    expect(buildLineChart([0, 0, 0], 3).line).toBe('0.0,102.0 150.0,102.0 300.0,102.0')
  })

  it('draws nothing before the period starts or with no buckets', () => {
    expect(buildLineChart([1, 2, 3], 0)).toEqual({ line: '', area: '', last: null })
    expect(buildLineChart([], 5)).toEqual({ line: '', area: '', last: null })
  })

  it('handles a single bucket and clamps the count', () => {
    expect(buildLineChart([7], 99).line).toBe('0.0,16.0')
  })
})

describe('buildBarHeights', () => {
  it('scales to the tallest bar with a 6% minimum and a 4% stub for empty buckets', () => {
    expect(buildBarHeights([50, 100, 0, 1])).toEqual([50, 100, 4, 6])
    expect(buildBarHeights([0, 0])).toEqual([4, 4])
  })
})
