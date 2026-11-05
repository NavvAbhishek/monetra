import * as Icon from '@/components/icons'
import { IconButton } from '@/components/ui/icon-button'
import { SegmentedTabs } from '@/components/ui/segmented-tabs'
import { LIST_PERIOD_OPTIONS } from '../helpers/ExpensesHelpers'
import type { ExpensesCtx } from '../hooks/useExpenses'

/** ‹ Nov 23 – 29 › — step through periods; "next" stops at the current one. */
export const PeriodStepper = ({ ctx }: { ctx: ExpensesCtx }) => (
  <div className="flex items-center gap-1" role="group" aria-label="Period">
    <IconButton variant="surface" size="md" aria-label="Previous period" onClick={ctx.goPrevious}>
      <Icon.ChevronLeft aria-hidden />
    </IconButton>
    <span className="flex h-11 min-w-32 items-center justify-center gap-2 rounded-icon bg-card px-3.5 text-base font-semibold text-ink" aria-live="polite">
      <Icon.Calendar className="size-4 text-muted-foreground" aria-hidden />
      {ctx.periodLabel}
    </span>
    <IconButton variant="surface" size="md" aria-label="Next period" onClick={ctx.goNext} disabled={ctx.isCurrentPeriod}>
      <Icon.ChevronRight aria-hidden />
    </IconButton>
  </div>
)

/** Week | Month | Year. */
export const PeriodTabs = ({ ctx }: { ctx: ExpensesCtx }) => (
  <SegmentedTabs
    variant="pill"
    size="sm"
    aria-label="Show by"
    value={ctx.period}
    onValueChange={ctx.setPeriod}
    options={LIST_PERIOD_OPTIONS}
  />
)
