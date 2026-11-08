import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { buildDonutArcs, DONUT_RADIUS, DONUT_SIZE, DONUT_STROKE } from './chart-geometry'

export type DonutSlice = {
  key: string
  value: number
  /** Full Tailwind stroke class, e.g. 'stroke-cat-0-strong' (see `toneStroke`). */
  strokeClass: string
}

export type DonutChartProps = {
  slices: readonly DonutSlice[]
  /** The slice to emphasise (the others fade). */
  activeKey?: string | null
  onActiveChange?: (key: string | null) => void
  /** Shown in the middle of the ring. */
  children?: ReactNode
  /** Spoken summary — the list beside the chart holds the same data in readable form. */
  ariaLabel: string
  className?: string
}

/** Ring chart: one coloured slice per category, with content (total / the hovered category) in the middle. */
const DonutChart = ({ slices, activeKey, onActiveChange, children, ariaLabel, className }: DonutChartProps) => {
  const arcs = buildDonutArcs(slices.map((s) => s.value))
  const center = DONUT_SIZE / 2

  return (
    <figure role="img" aria-label={ariaLabel} className={cn('relative', className)}>
      <svg viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`} className="size-full -rotate-90" aria-hidden>
        <circle cx={center} cy={center} r={DONUT_RADIUS} strokeWidth={DONUT_STROKE} className="fill-none stroke-muted" />
        {slices.map((slice, i) =>
          slice.value > 0 ? (
            <circle
              key={slice.key}
              cx={center}
              cy={center}
              r={DONUT_RADIUS}
              strokeWidth={DONUT_STROKE}
              strokeDasharray={arcs[i].dashArray}
              strokeDashoffset={arcs[i].dashOffset}
              onMouseEnter={() => onActiveChange?.(slice.key)}
              onMouseLeave={() => onActiveChange?.(null)}
              // touch / pen have no hover: a tap toggles the slice (a mouse already shows it on hover)
              onPointerUp={(e) => e.pointerType !== 'mouse' && onActiveChange?.(activeKey === slice.key ? null : slice.key)}
              className={cn('fill-none transition-opacity duration-150', slice.strokeClass, activeKey && activeKey !== slice.key && 'opacity-25')}
            />
          ) : null,
        )}
      </svg>
      <div className="absolute inset-0 grid place-items-center p-8 text-center">{children}</div>
    </figure>
  )
}

export default DonutChart
