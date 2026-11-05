import * as Icon from '@/components/icons'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { IconButton } from '@/components/ui/icon-button'
import { PageHeader } from '@/components/ui/page-header'
import { Link } from '@/router/navigation'
import CategoriesSkeleton from './components/CategoriesSkeleton'
import CategoryEditorScreen from './components/CategoryEditorScreen'
import CategoryEditPanel from './components/CategoryEditPanel'
import CategoryGrid from './components/CategoryGrid'
import { getSubtitle } from './helpers/CategoriesHelpers'
import { useCategories } from './hooks/useCategories'

/**
 * /categories, /categories/new and /categories/$categoryId all render this page (CLAUDE.md §4).
 * Desktop (D4): grid + side panel when new / edit. Mobile: list (M4), or the full-screen editor (M5).
 */
const Categories = () => {
  const ctx = useCategories()
  const { isMobile, mode, selected, categories, isLoading, isError, notFound, retry } = ctx
  const editing = mode.kind !== 'list'

  // Mobile editor — wait for the data so the form starts with the right values
  if (isMobile && editing && !isLoading && !isError && !notFound) {
    return <CategoryEditorScreen key={selected?.id ?? 'new'} ctx={ctx} />
  }

  return (
    <div className="flex items-start gap-8">
      <section className="flex min-w-0 flex-1 flex-col gap-5">
        <PageHeader
          title="Categories"
          description={getSubtitle(categories, ctx.monthName, isMobile)}
          actions={
            isMobile ? (
              <IconButton asChild variant="primary" size="lg" aria-label="Add category">
                <Link to="/categories/new">
                  <Icon.Plus aria-hidden />
                </Link>
              </IconButton>
            ) : (
              <Button asChild>
                <Link to="/categories/new">+ New category</Link>
              </Button>
            )
          }
          className="flex-nowrap"
        />

        {isLoading ? (
          <CategoriesSkeleton compact={isMobile} />
        ) : isError ? (
          <EmptyState
            emoji="⚠️"
            title="Couldn’t load your categories"
            description="Check your connection and try again."
            action={<Button onClick={retry}>Try again</Button>}
          />
        ) : notFound ? (
          <EmptyState
            emoji="🔍"
            title="Category not found"
            description="It may have been deleted."
            action={
              <Button asChild>
                <Link to="/categories">Back to categories</Link>
              </Button>
            }
          />
        ) : (
          <CategoryGrid ctx={ctx} />
        )}
      </section>

      {!isMobile && editing && !isLoading && !notFound && (
        <CategoryEditPanel key={selected?.id ?? 'new'} ctx={ctx} />
      )}
    </div>
  )
}

export default Categories
