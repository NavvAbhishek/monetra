export type Category = {
  id: string
  name: string
  emoji: string
  /** 0–5 → constant/categoryColours.ts */
  colourIndex: number
  /** Display order (ascending). */
  order: number
  createdAt: Date
}

export type CategoryInput = Pick<Category, 'name' | 'emoji' | 'colourIndex'>
