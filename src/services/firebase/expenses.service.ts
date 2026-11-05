import {
  count,
  deleteDoc,
  getAggregateFromServer,
  limit,
  sum,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { getDb } from '@/lib/firebase'
import type { ExpenseInput } from '@/types/expense'
import type { ExpensesService } from '../contracts'
import { ServiceError } from '../errors'
import { expenseFromDoc, toTimestamp } from './converters'
import { guard } from './errors'
import { categoriesCol, categoryRef, expenseRef, expensesCol } from './paths'

/** Firestore allows 500 writes per batch; stay under it. */
const BATCH_LIMIT = 450

const notFound = () => new ServiceError('expense/not-found', 'Expense not found.')

/** Same checks as the mock backend; the security rules check them again on the server. */
const validate = async (uid: string, input: ExpenseInput) => {
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    throw new ServiceError('expense/invalid', 'Enter an amount greater than 0.')
  }
  if (Number.isNaN(input.spentAt.getTime())) throw new ServiceError('expense/invalid', 'Choose a valid date.')
  if (!(await getDoc(categoryRef(uid, input.categoryId))).exists()) {
    throw new ServiceError('category/not-found', 'That category no longer exists.')
  }
}

const toData = (input: ExpenseInput) => ({
  amountCents: input.amountCents,
  categoryId: input.categoryId,
  spentAt: toTimestamp(input.spentAt),
  note: input.note.trim(),
})

export const expensesFirebase: ExpensesService = {
  /** Only the visible window is read (CLAUDE.md §1.5). Single-field index on spentAt — no composite index needed. */
  expense_listInRange: guard(async (uid, range) => {
    const snap = await getDocs(
      query(
        expensesCol(uid),
        where('spentAt', '>=', toTimestamp(range.start)),
        where('spentAt', '<', toTimestamp(range.end)),
        orderBy('spentAt', 'desc'),
      ),
    )
    return snap.docs.map(expenseFromDoc)
  }),

  expense_get: guard(async (uid, id) => {
    const snap = await getDoc(expenseRef(uid, id))
    return snap.exists() ? expenseFromDoc(snap) : null
  }),

  expense_create: guard(async (uid, input) => {
    await validate(uid, input)
    const ref = doc(expensesCol(uid))
    const now = Timestamp.now()
    await setDoc(ref, { ...toData(input), createdAt: now, updatedAt: now })
    return expenseFromDoc(await getDoc(ref))
  }),

  expense_update: guard(async (uid, id, input) => {
    await validate(uid, input)
    const ref = expenseRef(uid, id)
    if (!(await getDoc(ref)).exists()) throw notFound()
    await updateDoc(ref, { ...toData(input), updatedAt: Timestamp.now() })
    return expenseFromDoc(await getDoc(ref))
  }),

  expense_delete: guard(async (uid, id) => {
    const ref = expenseRef(uid, id)
    if (!(await getDoc(ref)).exists()) throw notFound()
    await deleteDoc(ref)
  }),

  /** Count aggregation: billed as 1 read per 1,000 matches instead of reading every expense. */
  expense_countForCategory: guard(async (uid, categoryId) => {
    const snap = await getCountFromServer(query(expensesCol(uid), where('categoryId', '==', categoryId)))
    return snap.data().count
  }),

  /**
   * All-time totals with server-side aggregation: billed ~1 read per 1,000 expenses per query,
   * instead of downloading every expense (keeps the Past spending page free at any size).
   */
  expense_totals: guard(async (uid) => {
    const col = expensesCol(uid)
    const [overall, first, categories] = await Promise.all([
      getAggregateFromServer(col, { total: sum('amountCents'), count: count() }),
      getDocs(query(col, orderBy('spentAt', 'asc'), limit(1))),
      getDocs(categoriesCol(uid)),
    ])
    const perCategory = await Promise.all(
      categories.docs.map(async (c) => {
        const agg = await getAggregateFromServer(query(col, where('categoryId', '==', c.id)), { total: sum('amountCents') })
        return [c.id, agg.data().total ?? 0] as const
      }),
    )
    const firstDoc = first.docs[0]
    return {
      totalCents: overall.data().total ?? 0,
      count: overall.data().count,
      byCategory: Object.fromEntries(perCategory.filter(([, cents]) => cents > 0)),
      firstSpentAt: firstDoc ? expenseFromDoc(firstDoc).spentAt : null,
    }
  }),

  expense_reassignCategory: guard(async (uid, fromCategoryId, toCategoryId) => {
    for (const id of [fromCategoryId, toCategoryId]) {
      if (!(await getDoc(categoryRef(uid, id))).exists()) {
        throw new ServiceError('category/not-found', 'That category no longer exists.')
      }
    }
    const snap = await getDocs(query(expensesCol(uid), where('categoryId', '==', fromCategoryId)))
    const now = Timestamp.now()
    for (let i = 0; i < snap.docs.length; i += BATCH_LIMIT) {
      const batch = writeBatch(getDb())
      snap.docs.slice(i, i + BATCH_LIMIT).forEach((d) => batch.update(d.ref, { categoryId: toCategoryId, updatedAt: now }))
      await batch.commit()
    }
    return snap.docs.length
  }),
}
