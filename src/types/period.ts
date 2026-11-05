export const PERIOD_KEYS = ['day', 'week', 'month', 'year', 'range'] as const

export type PeriodKey = (typeof PERIOD_KEYS)[number]

/** Inclusive start, exclusive end. */
export type DateRange = { start: Date; end: Date }

/** Serializable form of a custom range (stored in ui.store / localStorage). */
export type IsoDateRange = { start: string; end: string }
