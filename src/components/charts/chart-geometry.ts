/**
 * Geometry for the hero line chart, using the design's own formula (viewBox 300 × 110):
 *   x = i · 300 / (n − 1)      y = 110 − 8 − value / max · (110 − 24)
 * Pure — no React, easy to reason about.
 */
export const CHART_W = 300
export const CHART_H = 110
const BOTTOM_PAD = 8
const TOP_PAD = 16 // 24 − 8

export type LineChartGeometry = {
  /** `points` attribute for the <polyline>. Empty when nothing has happened yet. */
  line: string
  /** `d` attribute for the filled area under the line. */
  area: string
  /** Last plotted point as % of the box — positions the round marker. Null when nothing is plotted. */
  last: { xPct: number; yPct: number } | null
}

/**
 * @param values one value per bucket (all of them, so the x-axis spacing is right)
 * @param count  how many buckets to plot (the ones that have started)
 */
export const buildLineChart = (values: readonly number[], count: number): LineChartGeometry => {
  const n = values.length
  const plotted = Math.max(0, Math.min(count, n))
  if (n === 0 || plotted === 0) return { line: '', area: '', last: null }

  const max = Math.max(...values, 0)
  const step = n > 1 ? CHART_W / (n - 1) : 0
  const y = (v: number) => (max > 0 ? CHART_H - BOTTOM_PAD - (v / max) * (CHART_H - BOTTOM_PAD - TOP_PAD) : CHART_H - BOTTOM_PAD)
  const pts = values.slice(0, plotted).map((v, i) => [i * step, y(v)] as const)
  const f = ([x, yy]: readonly [number, number]) => `${x.toFixed(1)},${yy.toFixed(1)}`
  const lastPt = pts[pts.length - 1]

  return {
    line: pts.map(f).join(' '),
    area: `M0,${CHART_H} L${pts.map(f).join(' L')} L${lastPt[0].toFixed(1)},${CHART_H} Z`,
    last: { xPct: (lastPt[0] / CHART_W) * 100, yPct: (lastPt[1] / CHART_H) * 100 },
  }
}

/** Bar heights in % of the tallest bar; empty buckets get a small 4% stub (as in the design). */
export const buildBarHeights = (values: readonly number[]): number[] => {
  const max = Math.max(...values, 0)
  return values.map((v) => (v > 0 && max > 0 ? Math.max(6, (v / max) * 100) : 4))
}

// ---------------------------- Donut chart ----------------------------

export const DONUT_SIZE = 120
export const DONUT_RADIUS = 46
export const DONUT_STROKE = 16
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS
/** Space between slices, in circumference units. */
const DONUT_GAP = 2.5

export type DonutArc = {
  /** `stroke-dasharray` — the visible part of the slice, then the gap to the rest of the ring. */
  dashArray: string
  /** `stroke-dashoffset` — where the slice starts. */
  dashOffset: number
}

/**
 * Ring slices for `values`, drawn as dashed strokes of one circle (start at 12 o'clock when the SVG is rotated -90°).
 * A lone slice is a full ring; zero / negative values and an all-zero total produce no visible slice.
 */
export const buildDonutArcs = (values: readonly number[]): DonutArc[] => {
  const total = values.reduce((sum, v) => sum + Math.max(v, 0), 0)
  const gap = values.filter((v) => v > 0).length > 1 ? DONUT_GAP : 0
  let covered = 0
  return values.map((v) => {
    const length = total > 0 && v > 0 ? (v / total) * DONUT_CIRCUMFERENCE : 0
    const visible = Math.max(length - gap, length > 0 ? 0.5 : 0)
    const arc = { dashArray: `${visible} ${DONUT_CIRCUMFERENCE - visible}`, dashOffset: -(covered + gap / 2) }
    covered += length
    return arc
  })
}
