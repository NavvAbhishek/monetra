import { cn } from '@/lib/utils'
import { buildBarHeights } from './chart-geometry'

export type BarChartProps = {
  values: readonly number[]
  labels: readonly string[]
  /** Highlighted bar (the current day / week / month), or null. */
  currentIndex: number | null
  ariaLabel: string
  className?: string
}

/** Bars per bucket — "Spending breakdown" (D1). Current bucket purple, others lavender, empty ones a stub. */
const BarChart = ({ values, labels, currentIndex, ariaLabel, className }: BarChartProps) => {
  const heights = buildBarHeights(values)
  return (
    <figure role="img" aria-label={ariaLabel} className={cn('flex items-end gap-2.5', className)}>
      {heights.map((h, i) => {
        const isCurrent = i === currentIndex
        return (
          <div key={`${labels[i]}-${i}`} className="flex h-full flex-1 flex-col items-center justify-end gap-2" aria-hidden>
            <div
              className={cn('w-full max-w-11 rounded-chip', isCurrent ? 'bg-primary' : values[i] > 0 ? 'bg-bar' : 'bg-bar-empty')}
              style={{ height: `${h}%` }}
            />
            <span className={cn('text-2xs', isCurrent ? 'font-bold text-ink' : 'font-medium text-muted-foreground')}>
              {labels[i]}
            </span>
          </div>
        )
      })}
    </figure>
  )
}

export default BarChart
