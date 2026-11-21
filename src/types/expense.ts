export type Expense = {
  id: string
  /** Integer minor units (cents). Always > 0. */
  amountCents: number
  categoryId: string
  /** Date + time the money was spent (Day view needs the time). */
  spentAt: Date
  /** 0–120 chars, may be "". */
  note: string
  /**
   * The separate amounts the total was made of (amount chips: 100 + 100 → [10000, 10000]), only when there were 2 or more.
   * Absent for a single amount — and for expenses saved before 2026-11-20, when only the total was kept.
   */
  amountParts?: number[]
  createdAt: Date
  updatedAt: Date
}

export type ExpenseInput = Pick<Expense, 'amountCents' | 'categoryId' | 'spentAt' | 'note' | 'amountParts'>

/** Most parts kept for one expense (the security rules allow up to this many). */
export const MAX_AMOUNT_PARTS = 20
