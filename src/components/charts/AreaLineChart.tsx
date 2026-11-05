import { cn } from '@/lib/utils'
import { buildLineChart, CHART_H, CHART_W } from './chart-geometry'

export type AreaLineChartProps = {
  values: readonly number[]
  labels: readonly string[]
  /** How many buckets have started (later ones are in the future and not drawn). */
  elapsedCount: number
  /** Spoken summary, e.g. "Spending this week: Mon $38.20, Tue $52.50 …". */
  ariaLabel: string
  className?: string
}

/** White line + soft area + yellow marker, on the purple "You spent" card (M1, D1). */
const AreaLineChart = ({ values, labels, elapsedCount, ariaLabel, className }: AreaLineChartProps) => {
  const { line, area, last } = buildLineChart(values, elapsedCount)
  return (
    <figure role="img" aria-label={ariaLabel} className={cn('flex flex-col', className)}>
      <div className="relative min-h-20 flex-1">
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 size-full overflow-visible"
          aria-hidden
        >
          {area && <path d={area} className="fill-primary-foreground/15" />}
          {line && (
            <polyline
              points={line}
              vectorEffect="non-scaling-stroke"
              className="fill-none stroke-primary-foreground stroke-3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
        </svg>
        {last && (
          // HTML, not SVG: the SVG stretches (preserveAspectRatio="none"), a circle in it would turn oval
          <span
            aria-hidden
            className="absolute -mt-2.5 -ml-2.5 size-3.5 rounded-full border-3 border-primary bg-highlight"
            style={{ left: `${last.xPct}%`, top: `${last.yPct}%` }}
          />
        )}
      </div>
      <div className="mt-1.5 flex justify-between text-2xs text-primary-foreground lg:mt-2.5 lg:text-xs" aria-hidden>
        {labels.map((label, i) => (
          <span key={`${label}-${i}`}>{label}</span>
        ))}
      </div>
    </figure>
  )
}

export default AreaLineChart
