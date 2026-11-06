import { format } from 'date-fns'
import type { VariantProps } from 'class-variance-authority'
import { useState } from 'react'
import CalendarMonth from '@/components/DateRangePicker/components/CalendarMonth'
import * as Icon from '@/components/icons'
import { Button } from '@/components/ui/button'
import { fieldVariants } from '@/components/ui/input-variants'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { parseIsoDate } from '@/utils/period'
import { useDatePicker } from './hooks/useDatePicker'

export type DatePickerProps = VariantProps<typeof fieldVariants> & {
  id?: string
  /** 'yyyy-MM-dd' */
  value: string
  onChange: (iso: string) => void
  /** Last selectable day, 'yyyy-MM-dd'. */
  max?: string
  placeholder?: string
  invalid?: boolean
  'aria-describedby'?: string
  className?: string
}

/**
 * Themed single-date picker (replaces the browser's native date input, which can't be styled).
 * Field-shaped button + a popover with the same calendar as the dashboard's range picker,
 * so it follows the design and the theme colour. Values are 'yyyy-MM-dd' strings.
 */
const DatePicker = ({ id, value, onChange, max, placeholder = 'Choose a date', invalid, variant, size, className, ...aria }: DatePickerProps) => {
  const [open, setOpen] = useState(false)
  const picker = useDatePicker({
    value,
    max,
    onPick: (iso) => {
      onChange(iso)
      setOpen(false)
    },
  })

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) picker.resetMonth()
        setOpen(next)
      }}
    >
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          aria-invalid={invalid || undefined}
          aria-haspopup="dialog"
          className={cn(
            fieldVariants({ variant, size }),
            'cursor-pointer justify-between text-left font-semibold outline-none focus-visible:border-primary data-[state=open]:border-primary aria-[invalid=true]:border-danger',
            className,
          )}
          {...aria}
        >
          <span className={cn('truncate', !picker.selected && 'font-normal text-muted-2')}>
            {picker.selected ? format(parseIsoDate(value), 'EEE, MMM d, yyyy') : placeholder}
          </span>
          <Icon.Calendar className="size-4.5 shrink-0 text-muted-foreground" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" collisionPadding={12} className="w-80 p-4" aria-label="Choose a date">
        <CalendarMonth ctx={picker.ctx} size="md" maxDate={picker.maxDate} />
        <div className="flex justify-end pt-2">
          <Button variant="link" size="sm" disabled={!picker.canPickToday} onClick={picker.pickToday}>
            Today
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default DatePicker
