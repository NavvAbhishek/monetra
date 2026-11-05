import { deleteDoc, doc, getCountFromServer, getDoc, getDocs, orderBy, query, setDoc, Timestamp, updateDoc, where } from 'firebase/firestore'
import type { Category } from '@/types/category'
import type { CategoriesService } from '../contracts'
import { ServiceError } from '../errors'
import { categoryFromDoc } from './converters'
import { guard } from './errors'
import { categoriesCol, categoryRef, expensesCol } from './paths'

const list = async (uid: string): Promise<Category[]> => {
  const snap = await getDocs(query(categoriesCol(uid), orderBy('order')))
  return snap.docs.map(categoryFromDoc)
}

const notFound = () => new ServiceError('category/not-found', 'Category not found.')

export const categoriesFirebase: CategoriesService = {
  category_list: guard(list),

  category_create: guard(async (uid, input) => {
    const existing = await list(uid)
    const ref = doc(categoriesCol(uid))
    const data = {
      name: input.name.trim(),
      emoji: input.emoji,
      colourIndex: input.colourIndex,
      order: existing.reduce((max, c) => Math.max(max, c.order), -1) + 1,
      createdAt: Timestamp.now(),
    }
    await setDoc(ref, data)
    return { id: ref.id, ...data, createdAt: data.createdAt.toDate() }
  }),

  category_update: guard(async (uid, id, input) => {
    const ref = categoryRef(uid, id)
    if (!(await getDoc(ref)).exists()) throw notFound()
    await updateDoc(ref, { name: input.name.trim(), emoji: input.emoji, colourIndex: input.colourIndex })
    return categoryFromDoc(await getDoc(ref))
  }),

  /** Same rules as the mock: not the last one, and only once no expense uses it. */
  category_delete: guard(async (uid, id) => {
    const all = await list(uid)
    if (!all.some((c) => c.id === id)) throw notFound()
    if (all.length <= 1) throw new ServiceError('category/last-category', 'You need at least one category.')
    const used = await getCountFromServer(query(expensesCol(uid), where('categoryId', '==', id)))
    if (used.data().count > 0) {
      throw new ServiceError('category/has-expenses', 'Move this category’s expenses to another category first.')
    }
    await deleteDoc(categoryRef(uid, id))
  }),
}
