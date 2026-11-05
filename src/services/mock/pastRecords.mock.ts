import type { PastRecord, PastRecordInput } from '@/types/pastRecord'
import type { PastRecordsService } from '../contracts'
import { ServiceError } from '../errors'
import { delay, newId, saveDb } from './db'
import { getDb } from './session'

const listFor = (uid: string): PastRecord[] => {
  const db = getDb()
  db.pastRecords ??= {}
  return (db.pastRecords[uid] ??= [])
}

const clone = (r: PastRecord): PastRecord => ({ ...r, createdAt: new Date(r.createdAt), updatedAt: new Date(r.updatedAt) })

const validate = (uid: string, input: PastRecordInput) => {
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    throw new ServiceError('pastRecord/invalid', 'Enter an amount greater than 0.')
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.start) || !/^\d{4}-\d{2}-\d{2}$/.test(input.end) || input.start > input.end) {
    throw new ServiceError('pastRecord/invalid', 'Choose a valid period.')
  }
  if (input.categoryId && !(getDb().categories[uid] ?? []).some((c) => c.id === input.categoryId)) {
    throw new ServiceError('category/not-found', 'That category no longer exists.')
  }
}

const findOrThrow = (uid: string, id: string) => {
  const record = listFor(uid).find((r) => r.id === id)
  if (!record) throw new ServiceError('pastRecord/not-found', 'Record not found.')
  return record
}

export const pastRecordsMock: PastRecordsService = {
  async pastRecord_list(uid) {
    await delay()
    return [...listFor(uid)].sort((a, b) => b.start.localeCompare(a.start) || b.end.localeCompare(a.end)).map(clone)
  },

  async pastRecord_create(uid, input) {
    await delay()
    validate(uid, input)
    const now = new Date()
    const record: PastRecord = { id: newId(), ...input, note: input.note.trim(), createdAt: now, updatedAt: now }
    listFor(uid).push(record)
    saveDb()
    return clone(record)
  },

  async pastRecord_update(uid, id, input) {
    await delay()
    validate(uid, input)
    const record = findOrThrow(uid, id)
    Object.assign(record, input, { note: input.note.trim(), updatedAt: new Date() })
    saveDb()
    return clone(record)
  },

  async pastRecord_delete(uid, id) {
    await delay()
    findOrThrow(uid, id)
    const db = getDb()
    db.pastRecords![uid] = listFor(uid).filter((r) => r.id !== id)
    saveDb()
  },

  async pastRecord_reassignCategory(uid, fromCategoryId, toCategoryId) {
    await delay()
    let moved = 0
    for (const r of listFor(uid)) {
      if (r.categoryId === fromCategoryId) {
        r.categoryId = toCategoryId
        r.updatedAt = new Date()
        moved += 1
      }
    }
    if (moved > 0) saveDb()
    return moved
  },
}
