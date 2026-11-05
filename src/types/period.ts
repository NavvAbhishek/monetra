export const PERIOD_KEYS = ['day', 'week', 'month', 'year', 'range'] as const

export type PeriodKey = (typeof PERIOD_KEYS)[number]

/** Inclusive start, EXCLUSIVE end. */
export type DateRange = { start: Date; end: Date }

/**
 * Serializable custom range (stored in ui.store / localStorage).
 * Both ends are INCLUSIVE local dates formatted 'yyyy-MM-dd' (what the user picked).
 */
export type IsoDateRange = { start: string; end: string }

/** One bar on a chart: label + the time span it covers (start inclusive, end exclusive). */
export type Bucket = { label: string; start: Date; end: Date }
