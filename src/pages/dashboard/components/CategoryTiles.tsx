import { Amount } from '@/components/ui/amount'
import { Tile } from '@/components/ui/tile'
import { toneText } from '@/components/ui/tone'
import { cn } from '@/lib/utils'
import { Link } from '@/router/navigation'
import type { DashboardCtx } from '../hooks/useDashboard'

/** Mobile: the top 4 categories as pastel tiles with their share (M1). */
const CategoryTiles = ({ ctx }: { ctx: DashboardCtx }) => (
  <section className="flex flex-col gap-2.5" aria-labelledby="dash-categories">
    <div className="flex items-baseline justify-between pt-1">
      <h2 id="dash-categories" className="text-xl font-bold text-ink">
        Categories
      </h2>
      <Link to="/categories" className="text-sm font-semibold text-primary hover:text-primary-hover">
        Manage
      </Link>
    </div>
    {ctx.categoryTotals.length === 0 ? (
      <p className="rounded-tile bg-card px-4 py-5 text-center text-sm text-muted-foreground">No spending in this period yet.</p>
    ) : (
      <ul className="grid grid-cols-2 gap-2.5">
        {ctx.categoryTotals.slice(0, 4).map(({ category, cents, percent }) => (
          <li key={category.id} className="contents">
            <Tile tone={category.colourIndex}>
              <div className="flex items-center justify-between">
                <span className="text-emoji-md" aria-hidden>
                  {category.emoji}
                </span>
                <span className={cn('text-xs font-semibold', toneText(category.colourIndex))}>{percent}%</span>
              </div>
              <span className="pt-1 text-sm text-text-soft">{category.name}</span>
              <Amount cents={cents} currency={ctx.currency} size="md" />
            </Tile>
          </li>
        ))}
      </ul>
    )}
  </section>
)

export default CategoryTiles
