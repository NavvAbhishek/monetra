import { collection, doc } from 'firebase/firestore'
import { getDb } from '@/lib/firebase'

/** Firestore paths (CLAUDE.md §5.1): everything lives under users/{uid}. */
export const profileRef = (uid: string) => doc(getDb(), 'users', uid)
export const categoriesCol = (uid: string) => collection(getDb(), 'users', uid, 'categories')
export const categoryRef = (uid: string, id: string) => doc(getDb(), 'users', uid, 'categories', id)
export const expensesCol = (uid: string) => collection(getDb(), 'users', uid, 'expenses')
export const expenseRef = (uid: string, id: string) => doc(getDb(), 'users', uid, 'expenses', id)
