import type { StackedBar } from '@/components/charts/StackedBarChart'
import type { Category } from '@/types/category'
import type { Expense } from '@/types/expense'
import type { Bucket } from '@/types/period'

/**
 * One stacked bar per bucket: spending split by category. `categories` is in stacking order
 * (bottom → top), so the biggest category is always the bottom block and colours line up with the donut.
 * `titleOf` names a bucket for the hover card ("Sat, Nov 7").
 */
export const buildStackedBars = (
  buckets: readonly Bucket[],
  expenses: readonly Expense[],
  categories: readonly Category[],
  tones: ReadonlyMap<string, number>,
  titleOf: (bucket: Bucket) => string,
): StackedBar[] => {
  const perBucket = buckets.map(() => new Map<string, number>())
  for (const expense of expenses) {
    const index = buckets.findIndex((b) => expense.spentAt >= b.start && expense.spentAt < b.end)
    if (index < 0) continue
    const sums = perBucket[index]
    sums.set(expense.categoryId, (sums.get(expense.categoryId) ?? 0) + expense.amountCents)
  }
  return buckets.map((bucket, i) => {
    const segments = categories.flatMap((c) => {
      const cents = perBucket[i].get(c.id) ?? 0
      return cents > 0 ? [{ id: c.id, name: c.name, emoji: c.emoji, tone: tones.get(c.id) ?? c.colourIndex, cents }] : []
    })
    return {
      label: bucket.label,
      title: titleOf(bucket),
      totalCents: segments.reduce((total, s) => total + s.cents, 0),
      segments,
    }
  })
}
