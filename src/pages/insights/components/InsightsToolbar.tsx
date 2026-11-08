import * as Icon from '@/components/icons'
import { IconButton } from '@/components/ui/icon-button'
import { SegmentedTabs } from '@/components/ui/segmented-tabs'
import { INSIGHTS_PERIOD_OPTIONS } from '../helpers/InsightsHelpers'
import type { InsightsCtx } from '../hooks/useInsights'

/** Week | Month | Year, and ‹ label › to step through periods ("next" stops at the current one). */
const InsightsToolbar = ({ ctx }: { ctx: InsightsCtx }) => (
  <>
    <SegmentedTabs
      variant="pill"
      size="sm"
      aria-label="Show by"
      value={ctx.period}
      onValueChange={ctx.setPeriod}
      options={INSIGHTS_PERIOD_OPTIONS}
    />
    {!ctx.isAll && (
    <div className="flex items-center gap-1" role="group" aria-label="Period">
      <IconButton variant="surface" size="md" aria-label="Previous period" onClick={ctx.goPrevious}>
        <Icon.ChevronLeft aria-hidden />
      </IconButton>
      <span className="flex h-11 min-w-28 items-center justify-center gap-2 rounded-icon bg-card px-3.5 text-base font-semibold text-ink" aria-live="polite">
        <Icon.Calendar className="size-4 text-muted-foreground" aria-hidden />
        {ctx.periodLabel}
      </span>
      <IconButton variant="surface" size="md" aria-label="Next period" onClick={ctx.goNext} disabled={ctx.isCurrentPeriod}>
        <Icon.ChevronRight aria-hidden />
      </IconButton>
    </div>
    )}
  </>
)

export default InsightsToolbar
