import { useState } from 'react'
import DonutChart from '@/components/charts/DonutChart'
import { Amount } from '@/components/ui/amount'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { EmojiBox } from '@/components/ui/emoji-box'
import { Progress } from '@/components/ui/progress'
import { toneStroke } from '@/components/ui/tone'
import { cn } from '@/lib/utils'
import { Link } from '@/router/navigation'
import { formatMoney } from '@/utils/money'
import type { DashboardCtx } from '../hooks/useDashboard'

/**
 * "Categories" card (D1, and mobile M1 under the hero): a donut of the period's spending next to a list with a bar, amount and share
 * per category (beside a large donut on desktop, below it on phones). Hover (desktop) or tap (phone) a slice or a row and the matching one is highlighted; the ring's centre shows its details.
 */
const CategoryBreakdown = ({ ctx, className }: { ctx: DashboardCtx; className?: string }) => {
  const [activeId, setActiveId] = useState<string | null>(null)
  const rows = ctx.categoryTotals
  const active = rows.find((r) => r.category.id === activeId)

  return (
    <Card className={className}>
      <CardHeader className="pb-1.5">
        <CardTitle>Categories</CardTitle>
        <Link to="/categories" className="text-sm font-semibold text-primary hover:text-primary-hover">
          Manage
        </Link>
      </CardHeader>

      {rows.length === 0 ? (
        <div className="m-auto flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">No spending in this period yet.</p>
          <Button asChild size="sm">
            <Link to="/expenses/new">+ Add expense</Link>
          </Button>
        </div>
      ) : (
        <div className={cn('flex flex-1', ctx.isMobile ? 'flex-col items-stretch gap-5 pt-2' : 'items-center gap-12')}>
          <DonutChart
            className={cn('shrink-0', ctx.isMobile ? 'mx-auto size-44' : 'size-96')}
            slices={rows.map((r) => ({ key: r.category.id, value: r.cents, strokeClass: toneStroke(r.tone) }))}
            activeKey={activeId}
            onActiveChange={setActiveId}
            ariaLabel={`Spending by category: ${rows.map((r) => `${r.category.name} ${r.percent}%`).join(', ')}`}
          >
            {active ? (
              <div className="flex min-w-0 flex-col items-center">
                <span className={ctx.isMobile ? 'text-lg' : 'text-emoji-lg'} aria-hidden>
                  {active.category.emoji}
                </span>
                <span className={cn('max-w-full truncate font-semibold text-ink', ctx.isMobile ? 'text-xs' : 'text-base')}>{active.category.name}</span>
                <span className={cn('font-extrabold text-ink', ctx.isMobile ? 'text-sm' : 'text-2xl')}>{formatMoney(active.cents, ctx.currency, { compact: true })}</span>
                <span className={cn('text-muted-foreground', ctx.isMobile ? 'text-2xs' : 'text-sm')}>{active.percent}%</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className={cn('text-muted-foreground', ctx.isMobile ? 'text-2xs' : 'text-sm')}>Total</span>
                <span className={cn('font-extrabold text-ink', ctx.isMobile ? 'text-md' : 'text-3xl')}>{formatMoney(ctx.totalCents, ctx.currency, { compact: true })}</span>
                <span className={cn('text-muted-foreground', ctx.isMobile ? 'text-2xs' : 'text-sm')}>
                  {rows.length} {rows.length === 1 ? 'category' : 'categories'}
                </span>
              </div>
            )}
          </DonutChart>

          <ul className="-mr-2 flex min-w-0 flex-1 flex-col pr-2">
            {rows.map(({ category, cents, percent, tone }) => (
              <li
                key={category.id}
                onMouseEnter={() => setActiveId(category.id)}
                onMouseLeave={() => setActiveId(null)}
                // touch has no hover: a tap highlights the row and its slice
                onPointerUp={(e) => e.pointerType !== 'mouse' && setActiveId(activeId === category.id ? null : category.id)}
                className={cn(
                  '-mx-2 flex items-center gap-3 rounded-control px-2 py-1.5 transition-colors',
                  activeId === category.id && 'bg-bg',
                  activeId && activeId !== category.id && 'opacity-60',
                )}
              >
                <EmojiBox emoji={category.emoji} tone={tone} size="sm" />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex justify-between gap-2 text-base">
                    <span className="truncate font-semibold text-ink">{category.name}</span>
                    <Amount cents={cents} currency={ctx.currency} />
                  </div>
                  <Progress
                    value={ctx.maxCategoryCents > 0 ? (cents / ctx.maxCategoryCents) * 100 : 0}
                    tone={tone}
                    label={`${category.name}: ${percent}% of spending`}
                  />
                </div>
                <span className="w-8.5 text-right text-xs text-muted-foreground">{percent}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}

export default CategoryBreakdown
