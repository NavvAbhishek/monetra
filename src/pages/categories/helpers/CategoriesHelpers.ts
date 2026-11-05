import type { Category } from '@/types/category'

export type CategoriesMode = { kind: 'list' } | { kind: 'new' } | { kind: 'edit'; id: string }

export type CategoryStats = { cents: number; count: number }

export const NO_STATS: CategoryStats = { cents: 0, count: 0 }

export const pluralise = (count: number, one: string, many = `${one}s`) => `${count} ${count === 1 ? one : many}`

/** "6 categories · tap one to edit" (mobile) · "6 categories · November totals" (desktop). */
export const getSubtitle = (categories: readonly Category[], monthName: string, isMobile: boolean) =>
  `${pluralise(categories.length, 'category', 'categories')} · ${isMobile ? 'tap one to edit' : `${monthName} totals`}`

/** Which screen the URL asks for: /categories, /categories/new or /categories/$categoryId. */
export const getMode = (pathname: string, categoryId: string | undefined): CategoriesMode => {
  if (pathname.endsWith('/categories/new')) return { kind: 'new' }
  if (categoryId) return { kind: 'edit', id: categoryId }
  return { kind: 'list' }
}
