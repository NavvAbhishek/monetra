import type { CategoryInput } from '@/types/category'

/** Seeded at sign-up (CLAUDE.md §7.4). colourIndex matches constant/categoryColours.ts. */
export const DEFAULT_CATEGORIES: readonly CategoryInput[] = [
  { emoji: '🍔', name: 'Food', colourIndex: 0 },
  { emoji: '🛒', name: 'Groceries', colourIndex: 1 },
  { emoji: '🏠', name: 'Bills', colourIndex: 2 },
  { emoji: '🚌', name: 'Transport', colourIndex: 3 },
  { emoji: '🎬', name: 'Fun', colourIndex: 4 },
  { emoji: '💊', name: 'Health', colourIndex: 5 },
]

export const MAX_CATEGORY_NAME_LENGTH = 24
export const MAX_NOTE_LENGTH = 120
