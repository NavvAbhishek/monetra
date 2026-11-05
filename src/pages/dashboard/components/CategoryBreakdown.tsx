import { Amount } from '@/components/ui/amount'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { EmojiBox } from '@/components/ui/emoji-box'
import { Progress } from '@/components/ui/progress'
import { Link } from '@/router/navigation'
import type { DashboardCtx } from '../hooks/useDashboard'

/** Desktop: every category with spending, a bar relative to the biggest, and its share (D1). */
const CategoryBreakdown = ({ ctx, className }: { ctx: DashboardCtx; className?: string }) => (
  <Card className={className}>
    <CardHeader className="pb-1.5">
      <CardTitle>Categories</CardTitle>
      <Link to="/categories" className="text-sm font-semibold text-primary hover:text-primary-hover">
        Manage
      </Link>
    </CardHeader>
    {ctx.categoryTotals.length === 0 ? (
      <p className="m-auto text-sm text-muted-foreground">No spending in this period yet.</p>
    ) : (
      <ul className="-mr-2 flex flex-col overflow-y-auto pr-2">
        {ctx.categoryTotals.map(({ category, cents, percent }) => (
          <li key={category.id} className="flex items-center gap-3 py-1.5">
            <EmojiBox emoji={category.emoji} tone={category.colourIndex} size="sm" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex justify-between gap-2 text-base">
                <span className="truncate font-semibold text-ink">{category.name}</span>
                <Amount cents={cents} currency={ctx.currency} />
              </div>
              <Progress
                value={ctx.maxCategoryCents > 0 ? (cents / ctx.maxCategoryCents) * 100 : 0}
                tone={category.colourIndex}
                label={`${category.name}: ${percent}% of spending`}
              />
            </div>
            <span className="w-8.5 text-right text-xs text-muted-foreground">{percent}%</span>
          </li>
        ))}
      </ul>
    )}
  </Card>
)

export default CategoryBreakdown
