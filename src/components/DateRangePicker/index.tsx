import { Button } from '@/components/ui/button'
import type { IsoDateRange } from '@/types/period'
import { formatRangeLabel } from '@/utils/period'
import CalendarMonth from './components/CalendarMonth'
import PresetList from './components/PresetList'
import { useDateRangePicker } from './hooks/useDateRangePicker'

export type DateRangePickerProps = {
  /** Range shown when the picker opens (inclusive 'yyyy-MM-dd' ends). */
  initial: IsoDateRange
  onApply: (range: IsoDateRange) => void
  onCancel: () => void
  /** popover = desktop (D1): presets column + calendar + footer. sheet = mobile (M6): chips + calendar + big button. */
  layout: 'popover' | 'sheet'
}

/**
 * Choose a custom date range: presets or two clicks on the calendar. Shared by the
 * dashboard's Range tab on desktop (popover) and mobile (bottom sheet).
 * The parent mounts it fresh each time it opens, so it always starts from `initial`.
 */
const DateRangePicker = ({ initial, onApply, onCancel, layout }: DateRangePickerProps) => {
  const ctx = useDateRangePicker(initial)
  const { draft, dayCount, result } = ctx
  const summary = draft.end ? formatRangeLabel(draft.start, draft.end) : `${formatRangeLabel(draft.start, draft.start)} – pick an end date`
  const days = dayCount ? `${dayCount} ${dayCount === 1 ? 'day' : 'days'}` : ''

  if (layout === 'sheet') {
    return (
      <div className="flex flex-col gap-4">
        <PresetList ctx={ctx} variant="chips" />
        <div className="rounded-table bg-card p-4">
          <CalendarMonth ctx={ctx} size="md" />
        </div>
        <div className="flex justify-between px-1 text-base">
          <span className="text-muted-foreground">{summary}</span>
          <span className="font-bold text-ink">{days}</span>
        </div>
        <Button size="xl" fullWidth disabled={!result} onClick={() => result && onApply(result)}>
          Show expenses
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="flex">
        <div className="w-42.5 shrink-0 border-r border-muted px-2.5 py-4">
          <PresetList ctx={ctx} variant="list" />
        </div>
        <div className="flex-1 px-4.5 py-4">
          <CalendarMonth ctx={ctx} size="sm" />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-muted px-4.5 py-3.5">
        <span className="text-base text-muted-foreground">
          {summary}
          {days && (
            <>
              {' · '}
              <span className="font-bold text-ink">{days}</span>
            </>
          )}
        </span>
        <div className="flex gap-2">
          <Button variant="muted" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" className="font-bold" disabled={!result} onClick={() => result && onApply(result)}>
            Apply
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DateRangePicker
