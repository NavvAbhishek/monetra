import { useState } from 'react'
import { useDeleteCategoryMutation } from '@/queries/categories/categories-mutations'
import { useGetCategoryExpenseCountQuery } from '@/queries/expenses/expenses-queries'
import type { Category } from '@/types/category'

type Options = {
  category: Category
  categories: readonly Category[]
  open: boolean
  onDeleted: () => void
}

export const useDeleteCategoryDialog = ({ category, categories, open, onDeleted }: Options) => {
  const countQuery = useGetCategoryExpenseCountQuery(category.id, open)
  const remove = useDeleteCategoryMutation()

  // Where the expenses go. Defaults to the first other category.
  const others = categories.filter((c) => c.id !== category.id)
  const [chosenId, setChosenId] = useState<string>()
  const moveToId = others.some((c) => c.id === chosenId) ? chosenId : others[0]?.id

  const expenseCount = countQuery.data ?? 0
  const needsMove = expenseCount > 0

  return {
    others,
    isLoading: countQuery.isPending,
    expenseCount,
    needsMove,
    /** The only category can't be deleted (CLAUDE.md §7.3). */
    isLastCategory: others.length === 0,
    moveToId,
    setMoveToId: setChosenId,
    isDeleting: remove.isPending,
    confirm: () => remove.mutate({ id: category.id, moveExpensesTo: needsMove ? moveToId : undefined }, { onSuccess: onDeleted }),
  }
}
