import { useState } from 'react'
import CategoryForm, { CATEGORY_FORM_ID } from '@/components/CategoryForm'
import { useCategoryForm } from '@/components/CategoryForm/hooks/useCategoryForm'
import * as Icon from '@/components/icons'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Link } from '@/router/navigation'
import type { CategoriesCtx } from '../hooks/useCategories'
import DeleteCategoryDialog from './DeleteCategoryDialog'

/**
 * Mobile full-screen editor (M5): back button, title, delete, big preview, fields, Save.
 * The page renders it with `key={selected?.id ?? 'new'}` so the form restarts for each category.
 */
const CategoryEditorScreen = ({ ctx }: { ctx: CategoriesCtx }) => {
  const { selected, categories, closeEditor } = ctx
  const [deleteOpen, setDeleteOpen] = useState(false)
  const formCtx = useCategoryForm({ category: selected, categoryCount: categories.length, onSaved: closeEditor })

  return (
    <div className="flex flex-col gap-3.5">
      <header className="flex items-center justify-between">
        <IconButton asChild variant="surface" size="lg" aria-label="Back to categories">
          <Link to="/categories">
            <Icon.ArrowLeft aria-hidden />
          </Link>
        </IconButton>
        <h1 className="text-lg font-bold text-ink">{selected ? 'Edit category' : 'New category'}</h1>
        {selected ? (
          <IconButton variant="danger-soft" size="lg" aria-label="Delete category" onClick={() => setDeleteOpen(true)}>
            <Icon.Trash2 aria-hidden />
          </IconButton>
        ) : (
          <span className="size-10.5" aria-hidden />
        )}
      </header>

      <CategoryForm ctx={formCtx} layout="screen" />

      {/* sticky: the save button is always reachable, above the iPhone home bar */}
      <div className="sticky bottom-0 -mx-5.5 mt-2 bg-bg/95 px-5.5 pt-3 pb-safe backdrop-blur">
        <Button type="submit" form={CATEGORY_FORM_ID} size="xl" fullWidth loading={formCtx.isSaving}>
          Save category
        </Button>
      </div>

      {selected && (
        <DeleteCategoryDialog
          category={selected}
          categories={categories}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onDeleted={closeEditor}
        />
      )}
    </div>
  )
}

export default CategoryEditorScreen
