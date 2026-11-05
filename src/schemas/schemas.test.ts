import type { Expense } from '@/types/expense'
import { forgotPasswordSchema, loginSchema, signupSchema } from './auth/authSchema'
import { categorySchema } from './category/categorySchema'
import { expenseFormToInput, expenseSchema, expenseToFormValues, resolveSpentAt } from './expense/expenseSchema'

const errorsOf = (result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) =>
  Object.fromEntries((result.error?.issues ?? []).map((i) => [String(i.path[0]), i.message]))

describe('auth schemas', () => {
  it('login: accepts valid and rejects bad input', () => {
    expect(loginSchema.safeParse({ email: 'sam@email.com', password: 'x', keepLoggedIn: true }).success).toBe(true)
    expect(errorsOf(loginSchema.safeParse({ email: 'nope', password: '', keepLoggedIn: false }))).toEqual({
      email: 'Enter a valid email address',
      password: 'Password is required',
    })
  })

  it('signup: password length, name and currency', () => {
    const ok = { name: 'Sam Perera', email: 'sam@email.com', password: 'longenough', currency: 'USD' }
    expect(signupSchema.safeParse(ok).success).toBe(true)
    expect(errorsOf(signupSchema.safeParse({ ...ok, name: ' ', password: 'short', currency: 'XXX' }))).toEqual({
      name: 'Name is required',
      password: 'Use at least 8 characters',
      currency: 'Choose a currency',
    })
  })

  it('trims the email', () => {
    const result = forgotPasswordSchema.parse({ email: '  sam@email.com ' })
    expect(result.email).toBe('sam@email.com')
  })
})

describe('categorySchema', () => {
  it('validates name, emoji and colour', () => {
    expect(categorySchema.safeParse({ name: 'Food', emoji: '🍔', colourIndex: 0 }).success).toBe(true)
    expect(errorsOf(categorySchema.safeParse({ name: '', emoji: '', colourIndex: 6 }))).toMatchObject({
      name: 'Name is required',
      emoji: 'Choose an emoji',
    })
    expect(categorySchema.safeParse({ name: 'x'.repeat(25), emoji: '🍔', colourIndex: 0 }).success).toBe(false)
    expect(categorySchema.safeParse({ name: 'Food', emoji: '🍔', colourIndex: 2.5 }).success).toBe(false)
  })
})

describe('expenseSchema', () => {
  const ok = { amount: '24.50', categoryId: 'c1', date: '2026-11-26', time: '13:10', note: 'Lunch with Ana' }

  it('accepts a valid form (time optional)', () => {
    expect(expenseSchema.safeParse(ok).success).toBe(true)
    expect(expenseSchema.safeParse({ ...ok, time: '' }).success).toBe(true)
  })

  it.each(['', '0', '-5', 'abc'])('rejects amount %j', (amount) => {
    expect(errorsOf(expenseSchema.safeParse({ ...ok, amount })).amount).toBe('Enter an amount greater than 0')
  })

  it('rejects missing category, bad date, bad time and long notes', () => {
    expect(errorsOf(expenseSchema.safeParse({ ...ok, categoryId: '' })).categoryId).toBe('Choose a category')
    expect(errorsOf(expenseSchema.safeParse({ ...ok, date: '2026-13-45' })).date).toBe('Choose a date')
    expect(errorsOf(expenseSchema.safeParse({ ...ok, time: '25:00' })).time).toBe('Enter a valid time')
    expect(expenseSchema.safeParse({ ...ok, note: 'x'.repeat(121) }).success).toBe(false)
  })
})

describe('expense form mapping', () => {
  const NOW = new Date(2026, 10, 26, 14, 30)

  it('resolveSpentAt: explicit time wins', () => {
    expect(resolveSpentAt('2026-11-20', '07:45', NOW)).toEqual(new Date(2026, 10, 20, 7, 45))
  })

  it('resolveSpentAt: no time → now for today, 12:00 for other days', () => {
    expect(resolveSpentAt('2026-11-26', '', NOW)).toEqual(new Date(2026, 10, 26, 14, 30))
    expect(resolveSpentAt('2026-11-20', '', NOW)).toEqual(new Date(2026, 10, 20, 12, 0))
  })

  it('form → input converts to cents and trims the note', () => {
    const input = expenseFormToInput(
      { amount: '24.5', categoryId: 'c1', date: '2026-11-26', time: '13:10', note: '  Lunch  ' },
      'USD',
      NOW,
    )
    expect(input).toEqual({
      amountCents: 2450,
      categoryId: 'c1',
      spentAt: new Date(2026, 10, 26, 13, 10),
      note: 'Lunch',
    })
  })

  it('expense → form values (and back) round-trips', () => {
    const expense: Expense = {
      id: 'e1',
      amountCents: 2450,
      categoryId: 'c1',
      spentAt: new Date(2026, 10, 26, 13, 10),
      note: 'Lunch with Ana',
      createdAt: NOW,
      updatedAt: NOW,
    }
    const values = expenseToFormValues(expense, 'USD')
    expect(values).toEqual({ amount: '24.50', categoryId: 'c1', date: '2026-11-26', time: '13:10', note: 'Lunch with Ana' })
    expect(expenseFormToInput(values, 'USD', NOW)).toEqual({
      amountCents: 2450,
      categoryId: 'c1',
      spentAt: expense.spentAt,
      note: 'Lunch with Ana',
    })
  })
})
