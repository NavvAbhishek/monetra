import StackedBarChart from '@/components/charts/StackedBarChart'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { formatCompactNumber, formatMoney } from '@/utils/money'
import type { InsightsCtx } from '../hooks/useInsights'

/** Year and All time: spending per month (per year once the history is long), split by category. */
const SpendingTrend = ({ ctx, className }: { ctx: InsightsCtx; className?: string }) => {
  if (!ctx.trend) return null
  const { bars, unit, currentIndex } = ctx.trend
  const best = bars.reduce((top, bar) => (bar.totalCents > top.totalCents ? bar : top), bars[0])

  return (
    <Card className={className}>
      <CardTitle>Spending by {unit}</CardTitle>
      <CardDescription>{best && best.totalCents > 0 ? `Highest: ${best.title} · ${formatMoney(best.totalCents, ctx.currency)}` : 'Nothing spent yet'}</CardDescription>
      <StackedBarChart
        className="min-h-56 flex-1 pt-3.5"
        bars={bars}
        currentIndex={currentIndex}
        ariaLabel={`Spending by ${unit}: ${bars.map((b) => `${b.title} ${formatMoney(b.totalCents, ctx.currency)}`).join(', ')}`}
        formatAxis={(cents) => formatCompactNumber(cents, ctx.currency)}
        formatFull={(cents) => formatMoney(cents, ctx.currency)}
      />
    </Card>
  )
}

export default SpendingTrend
