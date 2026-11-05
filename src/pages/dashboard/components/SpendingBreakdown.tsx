import BarChart from '@/components/charts/BarChart'
import { Card, CardTitle } from '@/components/ui/card'
import type { DashboardCtx } from '../hooks/useDashboard'

/** Desktop bar chart of the period (D1). */
const SpendingBreakdown = ({ ctx, className }: { ctx: DashboardCtx; className?: string }) => (
  <Card className={className}>
    <CardTitle>Spending breakdown</CardTitle>
    <BarChart
      className="flex-1 pt-3.5"
      values={ctx.bucketValues}
      labels={ctx.labels}
      currentIndex={ctx.currentBucketIndex}
      ariaLabel={ctx.chartLabel}
    />
  </Card>
)

export default SpendingBreakdown
