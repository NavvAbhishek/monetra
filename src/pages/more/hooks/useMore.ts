import { useState } from 'react'
import { useTargetStatus } from '@/hooks/use-target-status'
import { useGetCategoriesQuery } from '@/queries/categories/categories-queries'

/** The More page: the spending target + counts for the shortcuts. */
export const useMore = () => {
  const status = useTargetStatus()
  const categoriesQuery = useGetCategoriesQuery()
  const [editing, setEditing] = useState(false)

  return {
    ...status,
    categoryCount: categoriesQuery.data?.length,
    editing,
    openEditor: () => setEditing(true),
    closeEditor: () => setEditing(false),
  }
}

export type MoreCtx = ReturnType<typeof useMore>
