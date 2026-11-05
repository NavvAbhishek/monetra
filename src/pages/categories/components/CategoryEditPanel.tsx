import { useState } from 'react'
import CategoryForm, { CATEGORY_FORM_ID } from '@/components/CategoryForm'
import { useCategoryForm } from '@/components/CategoryForm/hooks/useCategoryForm'
import * as Icon from '@/components/icons'
import { Amount } from '@/components/ui/amount'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Link } from '@/router/navigation'
import { pluralise } from '../helpers/CategoriesHelpers'
import type { CategoriesCtx } from '../hooks/useCategories'
import DeleteCategoryDialog from './DeleteCategoryDialog'

/**
 * Desktop right-hand panel: edit the selected category, or create a new one (D4).
 * The page renders it with `key={selected?.id ?? 'new'}` so the form restarts for each category.
 */
const CategoryEditPanel = ({ ctx }: { ctx: CategoriesCtx }) => {
  const { selected, categories, currency, statsFor, closeEditor } = ctx
  const [deleteOpen, setDeleteOpen] = useState(false)
  const formCtx = useCategoryForm({ category: selected, categoryCount: categories.length, onSaved: closeEditor })
  const stats = selected ? statsFor(selected.id) : undefined

  return (
    <aside
      aria-label={selected ? 'Edit category' : 'New category'}
      className="sticky top-7 flex w-95 shrink-0 flex-col gap-4 rounded-card bg-card p-6.5 shadow-panel"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-ink">{selected ? 'Edit category' : 'New category'}</h2>
        <IconButton asChild variant="ghost" size="sm" aria-label="Close panel">
          <Link to="/categories">
            <Icon.X aria-hidden />
          </Link>
        </IconButton>
      </div>

      <CategoryForm
        ctx={formCtx}
        layout="panel"
        stats={
          stats && (
            <>
              <span className="text-sm text-muted-foreground">{pluralise(stats.count, 'expense')} this month</span>
              <Amount cents={stats.cents} currency={currency} size="lg" />
            </>
          )
        }
      />

      <div className="flex gap-2.5 pt-2">
        {selected && (
          <Button variant="danger-soft" size="lg" className="flex-1" onClick={() => setDeleteOpen(true)}>
            Delete
          </Button>
        )}
        <Button type="submit" form={CATEGORY_FORM_ID} size="lg" className="flex-2" loading={formCtx.isSaving}>
          {selected ? 'Save changes' : 'Create category'}
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
    </aside>
  )
}

export default CategoryEditPanel
