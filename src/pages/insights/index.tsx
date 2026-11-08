import AllTimeCard from '@/components/AllTimeCard'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { Link } from '@/router/navigation'
import CategoryComparison from './components/CategoryComparison'
import InsightsSkeleton from './components/InsightsSkeleton'
import InsightsToolbar from './components/InsightsToolbar'
import SpendingTrend from './components/SpendingTrend'
import SummaryTiles from './components/SummaryTiles'
import TopExpenses from './components/TopExpenses'
import WeekdayChart from './components/WeekdayChart'
import YearlyBreakdown from './components/YearlyBreakdown'
import { useInsights } from './hooks/useInsights'

/** Insights — the numbers behind the dashboard: totals vs the previous period, weekday pattern, categories, biggest expenses. */
const Insights = () => {
  const ctx = useInsights()

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Insights" description={`${ctx.heading}${ctx.isAll ? '' : ` · compared with ${ctx.previousName}`}${ctx.includesPast ? ' · includes past spending' : ''}`} actions={<InsightsToolbar ctx={ctx} />} />

      {ctx.isLoading ? (
        <InsightsSkeleton />
      ) : ctx.isError ? (
        <EmptyState
          emoji="⚠️"
          title="Couldn’t load your insights"
          description="Check your connection and try again."
          action={<Button onClick={ctx.retry}>Try again</Button>}
        />
      ) : !ctx.hasAnyData || (ctx.summary.count === 0 && ctx.categoryChanges.length === 0) ? (
        <EmptyState
          title="No expenses in this period"
          description="Add an expense, or step back to a period that has some."
          action={
            <Button asChild size="sm">
              <Link to="/expenses/new">+ Add expense</Link>
            </Button>
          }
        />
      ) : (
        <>
          <SummaryTiles ctx={ctx} />
          <SpendingTrend ctx={ctx} />
          <YearlyBreakdown ctx={ctx} />
          <div className="grid gap-5 lg:grid-cols-2">
            <WeekdayChart ctx={ctx} />
            <TopExpenses ctx={ctx} />
          </div>
          <CategoryComparison ctx={ctx} />
          <AllTimeCard />
        </>
      )}
    </div>
  )
}

export default Insights
