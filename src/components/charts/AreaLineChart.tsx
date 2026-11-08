import { cn } from '@/lib/utils'
import { buildLineChart, buildYTicks, CHART_H, CHART_W, MAX_FULL_LABELS, sparseLabelIndexes } from './chart-geometry'

export type AreaLineChartProps = {
  values: readonly number[]
  labels: readonly string[]
  /** How many buckets have started (later ones are in the future and not drawn). */
  elapsedCount: number
  /** Spoken summary, e.g. "Spending this week: Mon $38.20, Tue $52.50 …". */
  ariaLabel: string
  /** Turns a value into the short text on the left axis ("9.4K"). Omit it to draw no axis. */
  formatValue?: (value: number) => string
  className?: string
}

/** White line + soft area + yellow marker, on the purple "You spent" card (M1, D1). */
const AreaLineChart = ({ values, labels, elapsedCount, ariaLabel, formatValue, className }: AreaLineChartProps) => {
  const { line, area, last } = buildLineChart(values, elapsedCount)
  const ticks = formatValue ? buildYTicks(values) : []
  const hasAxis = ticks.length > 0
  return (
    <figure role="img" aria-label={ariaLabel} className={cn('flex flex-col', className)}>
      <div className="flex min-h-20 flex-1">
        {hasAxis && (
          <div className="relative w-10 shrink-0 text-2xs text-primary-foreground/80 lg:w-11 lg:text-xs" aria-hidden>
            {ticks.map((tick, i) => (
              <span
                key={i}
                className="absolute right-2 -translate-y-1/2 leading-none"
                style={{ top: `${tick.yPct}%` }}
              >
                {formatValue?.(tick.value)}
              </span>
            ))}
          </div>
        )}
        <div className="relative flex-1">
          <svg
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            preserveAspectRatio="none"
            className="absolute inset-0 size-full overflow-visible"
            aria-hidden
          >
            {ticks.map((tick, i) => (
              <line
                key={i}
                x1={0}
                x2={CHART_W}
                y1={(tick.yPct / 100) * CHART_H}
                y2={(tick.yPct / 100) * CHART_H}
                vectorEffect="non-scaling-stroke"
                className="stroke-primary-foreground/20 stroke-1"
              />
            ))}
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
      </div>
      {/* x-axis labels start where the plot starts (after the value axis) */}
      <div className={cn(hasAxis && 'ml-10 lg:ml-11')}>
        {labels.length > MAX_FULL_LABELS ? (
          // Many points (a month by day): label only 1, 5, 10 … and the last day, each under its own point.
          <div className="relative mt-1.5 h-4 text-2xs text-primary-foreground lg:mt-2.5 lg:h-4.5 lg:text-xs" aria-hidden>
            {sparseLabelIndexes(labels.length).map((i) => (
              <span
                key={`${labels[i]}-${i}`}
                className={cn('absolute top-0', i === 0 ? '' : i === labels.length - 1 ? '-translate-x-full' : '-translate-x-1/2')}
                style={{ left: `${(i / (labels.length - 1)) * 100}%` }}
              >
                {labels[i]}
              </span>
            ))}
          </div>
        ) : (
          <div className="mt-1.5 flex justify-between text-2xs text-primary-foreground lg:mt-2.5 lg:text-xs" aria-hidden>
            {labels.map((label, i) => (
              <span key={`${label}-${i}`}>{label}</span>
            ))}
          </div>
        )}
      </div>
    </figure>
  )
}

export default AreaLineChart
