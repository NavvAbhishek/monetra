export type Expense = {
  id: string
  /** Integer minor units (cents). Always > 0. */
  amountCents: number
  categoryId: string
  /** Date + time the money was spent (Day view needs the time). */
  spentAt: Date
  /** 0–120 chars, may be "". */
  note: string
  createdAt: Date
  updatedAt: Date
}

export type ExpenseInput = Pick<Expense, 'amountCents' | 'categoryId' | 'spentAt' | 'note'>
