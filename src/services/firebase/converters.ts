import { type DocumentData, type DocumentSnapshot, Timestamp } from 'firebase/firestore'
import type { Category } from '@/types/category'
import type { Expense } from '@/types/expense'
import type { PastPeriodType, PastRecord } from '@/types/pastRecord'
import type { Profile } from '@/types/profile'

/** Firestore ↔ app types. `Timestamp` never leaves `services/firebase/` (CLAUDE.md §9). */

export const toDate = (value: unknown): Date =>
  value instanceof Timestamp ? value.toDate() : value instanceof Date ? value : new Date(0)

export const toTimestamp = (date: Date): Timestamp => Timestamp.fromDate(date)

const str = (value: unknown, fallback = ''): string => (typeof value === 'string' ? value : fallback)
const num = (value: unknown, fallback = 0): number => (typeof value === 'number' ? value : fallback)

export const profileFromDoc = (snap: DocumentSnapshot<DocumentData>): Profile => {
  const d = snap.data() ?? {}
  return {
    uid: snap.id,
    name: str(d.name),
    email: str(d.email),
    currency: str(d.currency, 'USD'),
    createdAt: toDate(d.createdAt),
  }
}

export const categoryFromDoc = (snap: DocumentSnapshot<DocumentData>): Category => {
  const d = snap.data() ?? {}
  return {
    id: snap.id,
    name: str(d.name),
    emoji: str(d.emoji, '🧾'),
    colourIndex: num(d.colourIndex),
    order: num(d.order),
    createdAt: toDate(d.createdAt),
  }
}

export const expenseFromDoc = (snap: DocumentSnapshot<DocumentData>): Expense => {
  const d = snap.data() ?? {}
  return {
    id: snap.id,
    amountCents: num(d.amountCents),
    categoryId: str(d.categoryId),
    spentAt: toDate(d.spentAt),
    note: str(d.note),
    createdAt: toDate(d.createdAt),
    updatedAt: toDate(d.updatedAt),
  }
}

const PERIOD_TYPES: readonly PastPeriodType[] = ['month', 'year', 'range']

export const pastRecordFromDoc = (snap: DocumentSnapshot<DocumentData>): PastRecord => {
  const d = snap.data() ?? {}
  return {
    id: snap.id,
    amountCents: num(d.amountCents),
    categoryId: typeof d.categoryId === 'string' ? d.categoryId : null,
    periodType: PERIOD_TYPES.includes(d.periodType) ? d.periodType : 'range',
    start: str(d.start),
    end: str(d.end),
    note: str(d.note),
    createdAt: toDate(d.createdAt),
    updatedAt: toDate(d.updatedAt),
  }
}
