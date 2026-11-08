import { useState } from 'react'
import { toneFill, type Tone } from '@/components/ui/tone'
import { cn } from '@/lib/utils'
import { buildBarTicks, MAX_FULL_LABELS, sparseLabelIndexes } from './chart-geometry'

export type StackedBarSegment = { id: string; name: string; emoji: string; tone: Tone; cents: number }

export type StackedBar = {
  /** Short x-axis text ("7", "Mon", "J"). */
  label: string
  /** Long name for the tooltip ("Sat, Nov 7"). */
  title: string
  totalCents: number
  /** Bottom → top. Only categories that have spending in this bar. */
  segments: StackedBarSegment[]
}

export type StackedBarChartProps = {
  bars: readonly StackedBar[]
  /** Bar to emphasise (today / this week / this month), or null. */
  currentIndex: number | null
  ariaLabel: string
  /** Short axis text for an amount ("9.4K"). */
  formatAxis: (cents: number) => string
  /** Full amount for the tooltip ("LKR 9,398.00"). */
  formatFull: (cents: number) => string
  className?: string
}

/** One bar per bucket, split into category colours, with a value axis and a hover / focus tooltip. */
const StackedBarChart = ({ bars, currentIndex, ariaLabel, formatAxis, formatFull, className }: StackedBarChartProps) => {
  const [active, setActive] = useState<number | null>(null)
  const count = bars.length
  const max = Math.max(...bars.map((b) => b.totalCents), 0)
  const ticks = buildBarTicks(max)
  const activeBar = active === null ? null : bars[active]
  const sparse = count > MAX_FULL_LABELS

  return (
    <figure role="img" aria-label={ariaLabel} className={cn('flex flex-col', className)}>
      <div className="flex min-h-40 flex-1">
        <div className="relative w-11 shrink-0 text-xs text-muted-foreground" aria-hidden>
          {ticks.map((tick, i) => (
            <span key={i} className="absolute right-2 -translate-y-1/2 leading-none" style={{ top: `${tick.yPct}%` }}>
              {formatAxis(tick.value)}
            </span>
          ))}
        </div>

        <div className="relative flex-1" onMouseLeave={() => setActive(null)}>
          {ticks.map((tick, i) => (
            <span key={i} aria-hidden className="pointer-events-none absolute inset-x-0 h-px bg-line-soft" style={{ top: `${tick.yPct}%` }} />
          ))}

          <div className="absolute inset-0 flex gap-0.5" aria-hidden>
            {bars.map((bar, i) => (
              <div
                key={`${bar.label}-${i}`}
                tabIndex={0}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className={cn(
                  'flex h-full min-w-0 flex-1 flex-col-reverse items-center rounded-check outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active === i && 'bg-bg',
                )}
              >
                {bar.totalCents > 0 ? (
                  bar.segments.map((segment) => (
                    <span
                      key={segment.id}
                      className={cn('w-full max-w-9 last:rounded-t-check', toneFill(segment.tone))}
                      style={{ height: `${(segment.cents / max) * 100}%` }}
                    />
                  ))
                ) : (
                  <span className="h-1 w-full max-w-9 rounded-check bg-bar-empty" />
                )}
              </div>
            ))}
          </div>

          {activeBar && active !== null && (
            <div
              role="status"
              className="pointer-events-none absolute top-0 z-10 mx-1 w-52 rounded-panel bg-card p-3 text-ink shadow-pop"
              style={active < count / 2 ? { left: `${((active + 1) / count) * 100}%` } : { right: `${((count - active) / count) * 100}%` }}
            >
              <p className="text-sm font-bold">{activeBar.title}</p>
              <p className="text-xs text-muted-foreground">{activeBar.totalCents > 0 ? formatFull(activeBar.totalCents) : 'No spending'}</p>
              {activeBar.segments.length > 0 && (
                <ul className="mt-2 flex flex-col gap-1">
                  {[...activeBar.segments].reverse().map((segment) => (
                    <li key={segment.id} className="flex items-center gap-1.5 text-xs">
                      <span aria-hidden className={cn('size-2 shrink-0 rounded-full', toneFill(segment.tone))} />
                      <span className="min-w-0 flex-1 truncate">
                        {segment.emoji} {segment.name}
                      </span>
                      <span className="font-semibold">{formatFull(segment.cents)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* x-axis labels sit under their bars (after the value axis) */}
      <div className="ml-11">
        {sparse ? (
          <div className="relative mt-2 h-4 text-xs text-muted-foreground" aria-hidden>
            {sparseLabelIndexes(count).map((i) => (
              <span
                key={`${bars[i].label}-${i}`}
                className={cn('absolute top-0 -translate-x-1/2', i === currentIndex && 'font-bold text-ink')}
                style={{ left: `${((i + 0.5) / count) * 100}%` }}
              >
                {bars[i].label}
              </span>
            ))}
          </div>
        ) : (
          <div className="mt-2 flex gap-0.5 text-xs text-muted-foreground" aria-hidden>
            {bars.map((bar, i) => (
              <span key={`${bar.label}-${i}`} className={cn('flex-1 text-center', i === currentIndex && 'font-bold text-ink')}>
                {bar.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </figure>
  )
}

export default StackedBarChart
