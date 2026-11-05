import * as Icon from '@/components/icons'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { IconButton } from '@/components/ui/icon-button'
import { PageHeader } from '@/components/ui/page-header'
import CategoryBreakdown from './components/CategoryBreakdown'
import CategoryTiles from './components/CategoryTiles'
import DashboardPeriodTabs from './components/DashboardPeriodTabs'
import DashboardSkeleton from './components/DashboardSkeleton'
import RangePicker from './components/RangePicker'
import RecentExpenses from './components/RecentExpenses'
import SpendingBreakdown from './components/SpendingBreakdown'
import SpentCard from './components/SpentCard'
import { useDashboard } from './hooks/useDashboard'

/** Dashboard — M1 (mobile) · D1 (desktop), with the date range picker (M6 / D1 popover). */
const Dashboard = () => {
  const ctx = useDashboard()
  const { isMobile, isLoading, isError } = ctx

  const rangeTrigger = isMobile ? (
    <IconButton variant="surface" size="lg" aria-label="Choose dates">
      <Icon.Calendar aria-hidden />
    </IconButton>
  ) : (
    <Button variant="surface" aria-label={`Choose dates, now ${ctx.subtitle}`}>
      <Icon.Calendar aria-hidden />
      {ctx.subtitle}
    </Button>
  )

  const body = isLoading ? (
    <DashboardSkeleton compact={isMobile} />
  ) : isError ? (
    <EmptyState
      emoji="⚠️"
      title="Couldn’t load your dashboard"
      description="Check your connection and try again."
      action={<Button onClick={ctx.retry}>Try again</Button>}
    />
  ) : isMobile ? (
    <>
      <SpentCard ctx={ctx} />
      <CategoryTiles ctx={ctx} />
    </>
  ) : (
    <>
      <div className="grid grid-cols-5 gap-5">
        <SpentCard ctx={ctx} className="col-span-3 h-85" />
        <CategoryBreakdown ctx={ctx} className="col-span-2 h-85" />
      </div>
      <div className="grid grid-cols-2 gap-5">
        <SpendingBreakdown ctx={ctx} className="h-72" />
        <RecentExpenses ctx={ctx} />
      </div>
    </>
  )

  return (
    <div className={isMobile ? 'flex flex-col gap-3.5' : 'flex flex-col gap-5'}>
      <PageHeader
        eyebrow={`Hi ${ctx.firstName} 👋`}
        title="Your money"
        className={isMobile ? 'flex-nowrap items-center' : undefined}
        actions={
          isMobile ? (
            <RangePicker ctx={ctx} trigger={rangeTrigger} />
          ) : (
            <>
              <DashboardPeriodTabs ctx={ctx} />
              <RangePicker ctx={ctx} trigger={rangeTrigger} />
            </>
          )
        }
      />
      {isMobile && <DashboardPeriodTabs ctx={ctx} />}
      {body}
    </div>
  )
}

export default Dashboard
