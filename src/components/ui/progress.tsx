import { cn } from '@/lib/utils'
import { toneFill, type Tone } from './tone'

export type ProgressProps = {
  /** 0–100. */
  value: number
  /** Bar colour: category colourIndex or a named tone. Default primary. */
  tone?: Tone
  /** Accessible label, e.g. "Food — 27% of spending". */
  label: string
  className?: string
}

/** Horizontal bar (category breakdown on D1). */
export const Progress = ({ value, tone = 'primary', label, className }: ProgressProps) => {
  const pct = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0))
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className={cn('h-1.25 w-full overflow-hidden rounded-full bg-muted', className)}
    >
      <div className={cn('h-full rounded-full transition-[width]', toneFill(tone))} style={{ width: `${pct}%` }} />
    </div>
  )
}

export type SegmentedMeterProps = {
  /** How many segments are filled. */
  filled: number
  total?: number
  tone?: 'success' | 'primary' | 'danger'
  label: string
  className?: string
}

const METER_FILL = { success: 'bg-success', primary: 'bg-primary', danger: 'bg-danger' } as const

/** Segmented bar (password strength on M8 / D6). */
export const SegmentedMeter = ({ filled, total = 4, tone = 'success', label, className }: SegmentedMeterProps) => (
  <div
    role="meter"
    aria-label={label}
    aria-valuemin={0}
    aria-valuemax={total}
    aria-valuenow={filled}
    className={cn('flex gap-1', className)}
  >
    {Array.from({ length: total }, (_, i) => (
      <span key={i} className={cn('h-1 flex-1 rounded-full', i < filled ? METER_FILL[tone] : 'bg-line')} />
    ))}
  </div>
)
