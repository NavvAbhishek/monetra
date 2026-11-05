import * as Icon from '@/components/icons'
import { Amount } from '@/components/ui/amount'
import { Tile } from '@/components/ui/tile'
import { Link } from '@/router/navigation'
import type { Category } from '@/types/category'
import { pluralise, type CategoryStats } from '../helpers/CategoriesHelpers'

export type CategoryCardProps = {
  category: Category
  stats: CategoryStats
  currency: string
  /** Mobile layout (M4) instead of desktop (D4). */
  compact: boolean
  selected: boolean
}

/** One category tile: emoji, name, this month's total and entry count. Opens the editor. */
const CategoryCard = ({ category, stats, currency, compact, selected }: CategoryCardProps) => (
  <Tile
    asChild
    interactive
    tone={category.colourIndex}
    selected={selected}
    size={compact ? 'md' : 'lg'}
    className={compact ? 'relative h-32 justify-between rounded-table p-3.5' : 'h-39.5 justify-between'}
  >
    <Link to="/categories/$categoryId" params={{ categoryId: category.id }}>
      {compact ? (
        <>
          <span className="absolute top-3 right-3 grid size-7 place-items-center rounded-full bg-card/70" aria-hidden>
            <Icon.Pencil className="size-3.5" />
          </span>
          <span className="text-emoji-lg" aria-hidden>
            {category.emoji}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-md font-bold text-ink">{category.name}</span>
            <span className="text-xs text-text-soft">
              <Amount cents={stats.cents} currency={currency} className="text-xs font-normal text-text-soft" /> ·{' '}
              {pluralise(stats.count, 'entry', 'entries')}
            </span>
          </span>
        </>
      ) : (
        <>
          <span className="flex items-start justify-between">
            <span className="text-emoji-xl" aria-hidden>
              {category.emoji}
            </span>
            <span className="text-xs font-semibold text-text-soft">{pluralise(stats.count, 'entry', 'entries')}</span>
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-lg font-bold text-ink">{category.name}</span>
            <Amount cents={stats.cents} currency={currency} size="lg" />
          </span>
        </>
      )}
    </Link>
  </Tile>
)

export default CategoryCard
