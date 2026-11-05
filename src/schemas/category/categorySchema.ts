import { z } from 'zod'
import { CATEGORY_COLOUR_COUNT } from '@/constant/categoryColours'
import { MAX_CATEGORY_NAME_LENGTH } from '@/constant/defaultCategories'

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(MAX_CATEGORY_NAME_LENGTH, `Use ${MAX_CATEGORY_NAME_LENGTH} characters or fewer`),
  emoji: z.string().min(1, 'Choose an emoji'),
  colourIndex: z
    .number()
    .int()
    .min(0)
    .max(CATEGORY_COLOUR_COUNT - 1),
})

export type CategoryFormValues = z.infer<typeof categorySchema>
