import { cn } from '@/lib/utils'
import { PRESETS } from '../helpers/DateRangePickerHelpers'
import type { DateRangePickerCtx } from '../hooks/useDateRangePicker'

/**
 * Quick ranges. `list` = vertical column on the left of the desktop popover (D1);
 * `chips` = horizontally scrolling chips in the mobile sheet (M6).
 */
const PresetList = ({ ctx, variant }: { ctx: DateRangePickerCtx; variant: 'list' | 'chips' }) => (
  <div
    role="group"
    aria-label="Quick ranges"
    className={variant === 'list' ? 'flex flex-col gap-0.5' : '-mx-6 flex gap-2 overflow-x-auto px-6 pb-0.5'}
  >
    {PRESETS.map((p) => {
      const active = ctx.preset === p.key
      return (
        <button
          key={p.key}
          type="button"
          aria-pressed={active}
          onClick={() => ctx.choosePreset(p.key)}
          className={cn(
            'shrink-0 cursor-pointer whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring',
            variant === 'list'
              ? cn('rounded-chip px-3 py-2.5 text-left text-base', active ? 'bg-primary-soft font-bold text-primary' : 'text-ink hover:bg-muted')
              : cn('h-9 rounded-control px-3 text-sm font-semibold', active ? 'bg-ink text-primary-foreground' : 'bg-card text-ink'),
          )}
        >
          {p.label}
        </button>
      )
    })}
  </div>
)

export default PresetList
