import type { Category } from '@/types/category'
import type { CategoriesService } from '../contracts'
import { ServiceError } from '../errors'
import { cloneCategory, delay, newId, saveDb } from './db'
import { getDb } from './session'

const listFor = (uid: string): Category[] => {
  const db = getDb()
  return (db.categories[uid] ??= [])
}

const findOrThrow = (uid: string, id: string): Category => {
  const category = listFor(uid).find((c) => c.id === id)
  if (!category) throw new ServiceError('category/not-found', 'Category not found.')
  return category
}

export const categoriesMock: CategoriesService = {
  async category_list(uid) {
    await delay()
    return [...listFor(uid)].sort((a, b) => a.order - b.order).map(cloneCategory)
  },

  async category_create(uid, input) {
    await delay()
    const list = listFor(uid)
    const category: Category = {
      id: newId(),
      name: input.name.trim(),
      emoji: input.emoji,
      colourIndex: input.colourIndex,
      order: list.reduce((max, c) => Math.max(max, c.order), -1) + 1,
      createdAt: new Date(),
    }
    list.push(category)
    saveDb()
    return cloneCategory(category)
  },

  async category_update(uid, id, input) {
    await delay()
    const category = findOrThrow(uid, id)
    category.name = input.name.trim()
    category.emoji = input.emoji
    category.colourIndex = input.colourIndex
    saveDb()
    return cloneCategory(category)
  },

  async category_delete(uid, id) {
    await delay()
    const list = listFor(uid)
    findOrThrow(uid, id)
    if (list.length <= 1) {
      throw new ServiceError('category/last-category', 'You need at least one category.')
    }
    const inUse = (getDb().expenses[uid] ?? []).some((e) => e.categoryId === id)
    if (inUse) {
      throw new ServiceError('category/has-expenses', 'Move this category’s expenses to another category first.')
    }
    getDb().categories[uid] = list.filter((c) => c.id !== id)
    saveDb()
  },
}
