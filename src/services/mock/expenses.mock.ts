import type { Expense, ExpenseInput } from '@/types/expense'
import type { ExpensesService } from '../contracts'
import { ServiceError } from '../errors'
import { cloneExpense, delay, newId, saveDb } from './db'
import { getDb } from './session'

const listFor = (uid: string): Expense[] => {
  const db = getDb()
  return (db.expenses[uid] ??= [])
}

const requireCategory = (uid: string, categoryId: string) => {
  if (!(getDb().categories[uid] ?? []).some((c) => c.id === categoryId)) {
    throw new ServiceError('category/not-found', 'That category no longer exists.')
  }
}

const validate = (uid: string, input: ExpenseInput) => {
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    throw new ServiceError('expense/invalid', 'Enter an amount greater than 0.')
  }
  if (Number.isNaN(input.spentAt.getTime())) {
    throw new ServiceError('expense/invalid', 'Choose a valid date.')
  }
  requireCategory(uid, input.categoryId)
}

const findOrThrow = (uid: string, id: string): Expense => {
  const expense = listFor(uid).find((e) => e.id === id)
  if (!expense) throw new ServiceError('expense/not-found', 'Expense not found.')
  return expense
}

export const expensesMock: ExpensesService = {
  async expense_listInRange(uid, range) {
    await delay()
    return listFor(uid)
      .filter((e) => e.spentAt >= range.start && e.spentAt < range.end)
      .sort((a, b) => b.spentAt.getTime() - a.spentAt.getTime())
      .map(cloneExpense)
  },

  async expense_get(uid, id) {
    await delay()
    const expense = listFor(uid).find((e) => e.id === id)
    return expense ? cloneExpense(expense) : null
  },

  async expense_create(uid, input) {
    await delay()
    validate(uid, input)
    const now = new Date()
    const expense: Expense = {
      id: newId(),
      amountCents: input.amountCents,
      categoryId: input.categoryId,
      spentAt: new Date(input.spentAt),
      note: input.note.trim(),
      createdAt: now,
      updatedAt: now,
    }
    listFor(uid).push(expense)
    saveDb()
    return cloneExpense(expense)
  },

  async expense_update(uid, id, input) {
    await delay()
    validate(uid, input)
    const expense = findOrThrow(uid, id)
    expense.amountCents = input.amountCents
    expense.categoryId = input.categoryId
    expense.spentAt = new Date(input.spentAt)
    expense.note = input.note.trim()
    expense.updatedAt = new Date()
    saveDb()
    return cloneExpense(expense)
  },

  async expense_delete(uid, id) {
    await delay()
    findOrThrow(uid, id)
    getDb().expenses[uid] = listFor(uid).filter((e) => e.id !== id)
    saveDb()
  },

  async expense_countForCategory(uid, categoryId) {
    await delay()
    return listFor(uid).filter((e) => e.categoryId === categoryId).length
  },

  async expense_reassignCategory(uid, fromCategoryId, toCategoryId) {
    await delay()
    requireCategory(uid, fromCategoryId)
    requireCategory(uid, toCategoryId)
    const now = new Date()
    let moved = 0
    for (const expense of listFor(uid)) {
      if (expense.categoryId === fromCategoryId) {
        expense.categoryId = toCategoryId
        expense.updatedAt = now
        moved += 1
      }
    }
    if (moved > 0) saveDb()
    return moved
  },
}
