import { CATEGORY_COLOUR_COUNT } from '@/constant/categoryColours'
import type { Category } from '@/types/category'

/**
 * A colour per category for the charts, so no two slices / bars / meters look the same.
 * The categories come biggest first: each keeps the colour the user picked unless a bigger one already took it;
 * those get a colour nobody has claimed. With more categories than colours (6) the colours repeat.
 * Only the dashboard charts use this — the category itself keeps its own colour everywhere else.
 */
export const assignChartTones = (categories: readonly Pick<Category, 'id' | 'colourIndex'>[]): Map<string, number> => {
  const tones = new Map<string, number>()
  const claimed = new Set<number>()
  const clashing: string[] = []
  for (const c of categories) {
    const own = ((c.colourIndex % CATEGORY_COLOUR_COUNT) + CATEGORY_COLOUR_COUNT) % CATEGORY_COLOUR_COUNT
    if (claimed.has(own)) {
      clashing.push(c.id)
    } else {
      claimed.add(own)
      tones.set(c.id, own)
    }
  }
  const free = Array.from({ length: CATEGORY_COLOUR_COUNT }, (_, i) => i).filter((i) => !claimed.has(i))
  clashing.forEach((id, n) => tones.set(id, free.length > 0 ? free[n % free.length] : n % CATEGORY_COLOUR_COUNT))
  return tones
}
