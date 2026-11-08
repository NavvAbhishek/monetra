import AreaLineChart from '@/components/charts/AreaLineChart'
import { Amount } from '@/components/ui/amount'
import { cn } from '@/lib/utils'
import { formatCompactNumber } from '@/utils/money'
import type { DashboardCtx } from '../hooks/useDashboard'

/** The purple "You spent" card: total, comparison, line chart (M1, D1). */
const SpentCard = ({ ctx, className }: { ctx: DashboardCtx; className?: string }) => {
  const desktop = !ctx.isMobile
  return (
    <section
      aria-label="You spent"
      className={cn(
        'flex flex-col rounded-card bg-primary px-5 pt-5 pb-3.5 text-primary-foreground',
        desktop && 'px-6.5 pt-6 pb-4.5',
        className,
      )}
    >
      <div className={cn('flex justify-between', desktop ? 'text-base' : 'text-sm')}>
        <span>You spent</span>
        <span>{ctx.subtitle}</span>
      </div>
      <Amount cents={ctx.totalCents} currency={ctx.currency} size={desktop ? 'display' : 'hero'} tone="inverse" />
      <p className={desktop ? 'text-base' : 'text-xs'}>{ctx.comparison.text}</p>
      {ctx.includesPast && (
        <p className={desktop ? 'text-sm' : 'text-2xs'}>
          Includes past spending{ctx.pastIsEstimate ? ' · longer records are spread evenly over their days' : ''}
        </p>
      )}
      <AreaLineChart
        className={desktop ? 'mt-3.5 flex-1' : 'mt-2.5 h-30'}
        values={ctx.lineValues}
        labels={ctx.lineLabels}
        elapsedCount={ctx.lineElapsedCount}
        ariaLabel={ctx.chartLabel}
        formatValue={(cents) => formatCompactNumber(cents, ctx.currency)}
      />
    </section>
  )
}

export default SpentCard
