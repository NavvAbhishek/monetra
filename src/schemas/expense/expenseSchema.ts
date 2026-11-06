import { isValid, parse } from 'date-fns'
import { z } from 'zod'
import { MAX_NOTE_LENGTH } from '@/constant/defaultCategories'
import type { Expense, ExpenseInput } from '@/types/expense'
import { sumAmountExpression } from '@/utils/amountExpression'
import { fromCents, getCurrencyDigits } from '@/utils/money'

/** Same ceiling as the security rules (amountCents < 100,000,000,000). */
const MAX_TOTAL_CENTS = 100_000_000_000

/**
 * Form values stay STRINGS (what the inputs hold). `expenseFormToInput` converts them
 * to the typed `ExpenseInput` the services expect.
 */
export const expenseSchema = z
  .object({
  amount: z
    .string()
    // may be a sum of chips like "500+100+600" — saved once, as the total
    .refine((value) => (sumAmountExpression(value) ?? 0) > 0, 'Enter an amount greater than 0'),
  categoryId: z.string().min(1, 'Choose a category'),
  /** 'yyyy-MM-dd' */
  date: z.string().refine((value) => isValid(parse(value, 'yyyy-MM-dd', new Date())), 'Choose a date'),
  /** 'HH:mm', or '' to use the default time. */
  time: z.string().refine((value) => value === '' || /^([01]\d|2[0-3]):[0-5]\d$/.test(value), 'Enter a valid time'),
  note: z.string().max(MAX_NOTE_LENGTH, `Use ${MAX_NOTE_LENGTH} characters or fewer`),
  })
  .superRefine((v, ctx) => {
    if ((sumAmountExpression(v.amount) ?? 0) >= MAX_TOTAL_CENTS) {
      ctx.addIssue({ code: 'custom', path: ['amount'], message: 'This total is too large' })
    }
  })

export type ExpenseFormValues = z.infer<typeof expenseSchema>

/**
 * Date + optional time → Date (local). No time: now if the date is today,
 * otherwise 12:00 (CLAUDE.md §7.3). A time later today is capped to `now`'s date as given.
 */
export const resolveSpentAt = (date: string, time: string, now: Date = new Date()): Date => {
  const day = parse(date, 'yyyy-MM-dd', now)
  if (time) {
    const [h, m] = time.split(':').map(Number)
    day.setHours(h, m, 0, 0)
    return day
  }
  const isToday =
    day.getFullYear() === now.getFullYear() && day.getMonth() === now.getMonth() && day.getDate() === now.getDate()
  if (isToday) day.setHours(now.getHours(), now.getMinutes(), 0, 0)
  else day.setHours(12, 0, 0, 0)
  return day
}

export const expenseFormToInput = (
  values: ExpenseFormValues,
  currency: string,
  now: Date = new Date(),
): ExpenseInput => ({
  // the amount field may hold several chips ("500+100+600") — saved ONCE as their total
  amountCents: sumAmountExpression(values.amount, currency) ?? 0,
  categoryId: values.categoryId,
  spentAt: resolveSpentAt(values.date, values.time, now),
  note: values.note.trim(),
})

/** Expense → values for the edit form. */
export const expenseToFormValues = (expense: Expense, currency: string): ExpenseFormValues => {
  const pad = (n: number) => String(n).padStart(2, '0')
  const d = expense.spentAt
  return {
    amount: fromCents(expense.amountCents, currency).toFixed(getCurrencyDigits(currency)),
    categoryId: expense.categoryId,
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    note: expense.note,
  }
}
