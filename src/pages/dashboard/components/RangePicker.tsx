import type { ReactNode } from 'react'
import DateRangePicker from '@/components/DateRangePicker'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from '@/components/ui/sheet'
import type { DashboardCtx } from '../hooks/useDashboard'

/**
 * Wraps the date range picker: popover under the range button on desktop (D1),
 * bottom sheet on mobile (M6). Also opened by the Range tab.
 * Closing without "Apply" counts as Cancel.
 */
const RangePicker = ({ ctx, trigger }: { ctx: DashboardCtx; trigger: ReactNode }) => {
  const onOpenChange = (open: boolean) => (open ? ctx.openPicker() : ctx.cancelPicker())
  const picker = (layout: 'popover' | 'sheet') =>
    ctx.pickerOpen && (
      <DateRangePicker initial={ctx.pickerInitial} onApply={ctx.applyPicker} onCancel={ctx.cancelPicker} layout={layout} />
    )

  if (ctx.isMobile) {
    return (
      <Sheet open={ctx.pickerOpen} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent side="bottom">
          <SheetHeader title="Select dates" />
          {picker('sheet')}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Popover open={ctx.pickerOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="end" className="w-140 overflow-hidden p-0" aria-label="Select dates">
        {picker('popover')}
      </PopoverContent>
    </Popover>
  )
}

export default RangePicker
