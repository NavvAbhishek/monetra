import { SegmentedTabs } from '@/components/ui/segmented-tabs'
import { DASHBOARD_PERIOD_OPTIONS } from '../helpers/DashboardHelpers'
import type { DashboardCtx } from '../hooks/useDashboard'

/** Day | Week | Month | Year | Range. Mobile = dark pills across the width (M1); desktop = lavender track (D1). */
const DashboardPeriodTabs = ({ ctx }: { ctx: DashboardCtx }) => (
  <SegmentedTabs
    aria-label="Period"
    variant={ctx.isMobile ? 'pill' : 'track'}
    fullWidth={ctx.isMobile}
    value={ctx.period}
    onValueChange={ctx.changePeriod}
    options={DASHBOARD_PERIOD_OPTIONS}
  />
)

export default DashboardPeriodTabs
