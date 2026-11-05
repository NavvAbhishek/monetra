import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { CATEGORY_COLOUR_COUNT } from '@/constant/categoryColours'
import { EMOJIS } from '@/constant/emojis'
import { useCreateCategoryMutation, useUpdateCategoryMutation } from '@/queries/categories/categories-mutations'
import { categorySchema, type CategoryFormValues } from '@/schemas/category/categorySchema'
import type { Category } from '@/types/category'

type Options = {
  /** The category being edited, or undefined to create a new one. */
  category?: Category
  /** How many categories exist — the new one gets the next colour. */
  categoryCount: number
  onSaved: () => void
}

export const useCategoryForm = ({ category, categoryCount, onSaved }: Options) => {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: category
      ? { name: category.name, emoji: category.emoji, colourIndex: category.colourIndex }
      : { name: '', emoji: EMOJIS[0].emoji, colourIndex: categoryCount % CATEGORY_COLOUR_COUNT },
  })
  const create = useCreateCategoryMutation()
  const update = useUpdateCategoryMutation()

  const onSubmit = form.handleSubmit((values) => {
    const options = { onSuccess: onSaved }
    if (category) update.mutate({ id: category.id, input: values }, options)
    else create.mutate(values, options)
  })

  // Live preview of the emoji tile.
  const [emoji, colourIndex, name] = useWatch({ control: form.control, name: ['emoji', 'colourIndex', 'name'] })

  return {
    form,
    onSubmit,
    isSaving: create.isPending || update.isPending,
    preview: { emoji, colourIndex, name },
  }
}

export type CategoryFormCtx = ReturnType<typeof useCategoryForm>
