import { Tile } from '@/components/ui/tile'
import { Link } from '@/router/navigation'
import type { CategoriesCtx } from '../hooks/useCategories'
import CategoryCard from './CategoryCard'

/** Category cards + the dashed "New category" tile (M4 · D4). */
const CategoryGrid = ({ ctx }: { ctx: CategoriesCtx }) => {
  const { categories, currency, isMobile, mode, statsFor } = ctx
  const selectedId = mode.kind === 'edit' ? mode.id : undefined

  return (
    <ul className={isMobile ? 'grid grid-cols-2 gap-2.5' : 'grid grid-cols-3 gap-3.5'}>
      {categories.map((category) => (
        <li key={category.id} className="contents">
          <CategoryCard
            category={category}
            stats={statsFor(category.id)}
            currency={currency}
            compact={isMobile}
            selected={category.id === selectedId}
          />
        </li>
      ))}
      <li className={isMobile ? 'col-span-2' : 'contents'}>
        <Tile
          asChild
          dashed
          interactive
          selected={mode.kind === 'new'}
          size={isMobile ? 'md' : 'lg'}
          className={isMobile ? 'h-14.5 flex-row gap-1.5 rounded-tile text-base' : 'h-39.5 text-md'}
        >
          <Link to="/categories/new">
            {!isMobile && (
              <span className="text-4xl leading-none" aria-hidden>
                +
              </span>
            )}
            {isMobile && <span aria-hidden>+</span>}
            New category
          </Link>
        </Tile>
      </li>
    </ul>
  )
}

export default CategoryGrid
