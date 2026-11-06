import { format } from 'date-fns'
import * as Icon from '@/components/icons'
import { IconButton } from '@/components/ui/icon-button'
import { cn } from '@/lib/utils'
import { getDayState, getMonthGrid, WEEKDAY_INITIALS } from '../helpers/DateRangePickerHelpers'
import type { DateRangePickerCtx } from '../hooks/useDateRangePicker'

/** What the calendar needs — the range picker's state, or a single-date picker's (draft.start = draft.end). */
export type CalendarCtx = Pick<DateRangePickerCtx, 'month' | 'draft' | 'today' | 'selectDay' | 'previousMonth' | 'nextMonth' | 'canGoNext'>

/**
 * One month of days (Sunday first). The picked range shows as a soft strip; its two ends
 * are solid purple (M6, D1). Days after `maxDate` are disabled — by default, every day after today.
 * Also the calendar of the single-date `DatePicker`.
 */
const CalendarMonth = ({ ctx, size, maxDate }: { ctx: CalendarCtx; size: 'sm' | 'md'; maxDate?: Date }) => {
  const { month, draft, today, selectDay } = ctx
  const cells = getMonthGrid(month)
  const big = size === 'md'

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between pb-2.5">
        <IconButton variant="ghost" size="sm" aria-label="Previous month" onClick={ctx.previousMonth}>
          <Icon.ChevronLeft aria-hidden />
        </IconButton>
        <span className="text-md font-bold text-ink" aria-live="polite">
          {format(month, 'MMMM yyyy')}
        </span>
        <IconButton variant="ghost" size="sm" aria-label="Next month" onClick={ctx.nextMonth} disabled={!ctx.canGoNext}>
          <Icon.ChevronRight aria-hidden />
        </IconButton>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center" role="grid" aria-label={format(month, 'MMMM yyyy')}>
        {WEEKDAY_INITIALS.map((d, i) => (
          <span key={`${d}-${i}`} className="pb-1 text-2xs text-muted-foreground" aria-hidden>
            {d}
          </span>
        ))}
        {cells.map((day, i) => {
          if (!day) return <span key={`empty-${i}`} aria-hidden />
          const s = getDayState(day, draft, today)
          const disabled = maxDate ? day > maxDate : s.isFuture
          const isEdge = s.isStart || s.isEnd
          const hasStrip = !!draft.end && !(s.isStart && s.isEnd) && (s.isBetween || isEdge)
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'grid place-items-center',
                big ? 'h-10' : 'h-9',
                hasStrip && 'bg-primary-soft',
                hasStrip && s.isStart && 'rounded-l-icon',
                hasStrip && s.isEnd && 'rounded-r-icon',
              )}
            >
              <button
                type="button"
                disabled={disabled}
                aria-pressed={isEdge}
                aria-label={format(day, 'EEEE, MMMM d, yyyy')}
                aria-current={s.isToday ? 'date' : undefined}
                onClick={() => selectDay(day)}
                className={cn(
                  'grid cursor-pointer place-items-center outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed',
                  big ? 'size-9 rounded-control text-base' : 'size-8 rounded-chip text-sm',
                  isEdge
                    ? 'bg-primary font-bold text-primary-foreground'
                    : disabled
                      ? 'font-medium text-muted-2'
                      : 'font-medium text-ink hover:bg-muted',
                  s.isToday && !isEdge && 'underline underline-offset-4',
                )}
              >
                {format(day, 'd')}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CalendarMonth
