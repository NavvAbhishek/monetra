import StackedBarChart from '@/components/charts/StackedBarChart'
import { Card, CardTitle } from '@/components/ui/card'
import { formatCompactNumber, formatMoney } from '@/utils/money'
import { getBarChartTitle } from '../helpers/DashboardHelpers'
import type { DashboardCtx } from '../hooks/useDashboard'

/** Desktop stacked bars: spending per day / month / … split by category (D1). */
const SpendingBreakdown = ({ ctx, className }: { ctx: DashboardCtx; className?: string }) => (
  <Card className={className}>
    <CardTitle>{getBarChartTitle(ctx.period)}</CardTitle>
    <StackedBarChart
      className="flex-1 pt-3.5"
      bars={ctx.stackedBars}
      currentIndex={ctx.currentBucketIndex}
      ariaLabel={ctx.chartLabel}
      formatAxis={(cents) => formatCompactNumber(cents, ctx.currency)}
      formatFull={(cents) => formatMoney(cents, ctx.currency)}
    />
  </Card>
)

export default SpendingBreakdown
