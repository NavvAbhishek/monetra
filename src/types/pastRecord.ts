/**
 * Spending from BEFORE the user started Monetra (e.g. moved from another app).
 * Kept apart from expenses: never shown on the dashboard, expenses or categories pages —
 * only on the Past spending page and in the all-time total.
 */
export type PastPeriodType = 'month' | 'year' | 'range'

export type PastRecord = {
  id: string
  /** Integer cents, > 0. */
  amountCents: number
  /** null = "All categories" (the old app's total, not split by category). */
  categoryId: string | null
  periodType: PastPeriodType
  /** First day, 'yyyy-MM-dd' (inclusive). */
  start: string
  /** Last day, 'yyyy-MM-dd' (inclusive). */
  end: string
  /** 0–120 chars, may be "". */
  note: string
  createdAt: Date
  updatedAt: Date
}

export type PastRecordInput = Pick<PastRecord, 'amountCents' | 'categoryId' | 'periodType' | 'start' | 'end' | 'note'>

/** In-app (tracked) expense totals for the all-time view — computed with server-side sums, not by reading every expense. */
export type ExpenseTotals = {
  totalCents: number
  count: number
  /** categoryId → cents */
  byCategory: Record<string, number>
  /** Date of the earliest tracked expense, or null when there are none. */
  firstSpentAt: Date | null
}
