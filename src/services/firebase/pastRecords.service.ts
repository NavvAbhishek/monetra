import { deleteDoc, doc, getDoc, getDocs, setDoc, Timestamp, updateDoc, where, query, writeBatch } from 'firebase/firestore'
import { getDb } from '@/lib/firebase'
import type { PastRecordInput } from '@/types/pastRecord'
import type { PastRecordsService } from '../contracts'
import { ServiceError } from '../errors'
import { pastRecordFromDoc } from './converters'
import { guard } from './errors'
import { categoriesCol, categoryRef, pastRecordRef, pastRecordsCol } from './paths'

const BATCH_LIMIT = 450
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/

const notFound = () => new ServiceError('pastRecord/not-found', 'Record not found.')

/** Same checks as the mock; the security rules check them again on the server. */
const validate = async (uid: string, input: PastRecordInput) => {
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    throw new ServiceError('pastRecord/invalid', 'Enter an amount greater than 0.')
  }
  if (!ISO_DAY.test(input.start) || !ISO_DAY.test(input.end) || input.start > input.end) {
    throw new ServiceError('pastRecord/invalid', 'Choose a valid period.')
  }
  if (input.categoryId && !(await getDoc(categoryRef(uid, input.categoryId))).exists()) {
    throw new ServiceError('category/not-found', 'That category no longer exists.')
  }
}

const toData = (input: PastRecordInput) => ({
  amountCents: input.amountCents,
  categoryId: input.categoryId,
  periodType: input.periodType,
  start: input.start,
  end: input.end,
  note: input.note.trim(),
})

export const pastRecordsFirebase: PastRecordsService = {
  /** Few records per user, so all are read and sorted here (no index needed). */
  pastRecord_list: guard(async (uid) => {
    const snap = await getDocs(pastRecordsCol(uid))
    return snap.docs.map(pastRecordFromDoc).sort((a, b) => b.start.localeCompare(a.start) || b.end.localeCompare(a.end))
  }),

  pastRecord_create: guard(async (uid, input) => {
    await validate(uid, input)
    const ref = doc(pastRecordsCol(uid))
    const now = Timestamp.now()
    await setDoc(ref, { ...toData(input), createdAt: now, updatedAt: now })
    return pastRecordFromDoc(await getDoc(ref))
  }),

  /** CSV import: one category read for all rows, then batched writes (each batch is all-or-nothing). */
  pastRecord_createMany: guard(async (uid, inputs) => {
    const categoryIds = new Set((await getDocs(categoriesCol(uid))).docs.map((d) => d.id))
    for (const input of inputs) {
      if (!Number.isInteger(input.amountCents) || input.amountCents <= 0 || !ISO_DAY.test(input.start) || !ISO_DAY.test(input.end) || input.start > input.end) {
        throw new ServiceError('pastRecord/invalid', 'Some rows have an invalid amount or period.')
      }
      if (input.categoryId && !categoryIds.has(input.categoryId)) {
        throw new ServiceError('category/not-found', 'A category in the file no longer exists.')
      }
    }
    const now = Timestamp.now()
    for (let i = 0; i < inputs.length; i += BATCH_LIMIT) {
      const batch = writeBatch(getDb())
      inputs.slice(i, i + BATCH_LIMIT).forEach((input) => {
        batch.set(doc(pastRecordsCol(uid)), { ...toData(input), createdAt: now, updatedAt: now })
      })
      await batch.commit()
    }
    return inputs.length
  }),

  pastRecord_update: guard(async (uid, id, input) => {
    await validate(uid, input)
    const ref = pastRecordRef(uid, id)
    if (!(await getDoc(ref)).exists()) throw notFound()
    await updateDoc(ref, { ...toData(input), updatedAt: Timestamp.now() })
    return pastRecordFromDoc(await getDoc(ref))
  }),

  pastRecord_delete: guard(async (uid, id) => {
    const ref = pastRecordRef(uid, id)
    if (!(await getDoc(ref)).exists()) throw notFound()
    await deleteDoc(ref)
  }),

  pastRecord_reassignCategory: guard(async (uid, fromCategoryId, toCategoryId) => {
    const snap = await getDocs(query(pastRecordsCol(uid), where('categoryId', '==', fromCategoryId)))
    const now = Timestamp.now()
    for (let i = 0; i < snap.docs.length; i += BATCH_LIMIT) {
      const batch = writeBatch(getDb())
      snap.docs.slice(i, i + BATCH_LIMIT).forEach((d) => batch.update(d.ref, { categoryId: toCategoryId, updatedAt: now }))
      await batch.commit()
    }
    return snap.docs.length
  }),
}
