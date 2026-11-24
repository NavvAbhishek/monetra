import * as Icon from '@/components/icons'
import SetTargetPrompt from '@/components/target/SetTargetPrompt'
import TargetDialog from '@/components/target/TargetDialog'
import TargetSummaryRow from '@/components/target/TargetSummaryRow'
import { PageHeader } from '@/components/ui/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import HubLink from './components/HubLink'
import { useMore } from './hooks/useMore'

/**
 * More — the phones' fourth tab (user request 2026-11-24): a compact spending-target row (the full overview is on the dashboard), then shortcuts to Categories, Ask AI, Insights
 * and Past spending (these used to be squeezed onto the dashboard). Desktop has all of them in the sidebar.
 */
const More = () => {
  const ctx = useMore()
  const { target, progress, currency } = ctx

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <PageHeader title="More" description="Your target, categories and tools." />

      {ctx.isLoading ? (
        <Skeleton className="h-20 rounded-tile" />
      ) : target && progress ? (
        <TargetSummaryRow target={target} progress={progress} currency={currency} onEdit={ctx.openEditor} />
      ) : (
        <SetTargetPrompt unit="month" onSet={ctx.openEditor} />
      )}

      <div className="flex flex-col gap-2.5">
        <HubLink
          to="/categories"
          icon={Icon.LayoutGrid}
          title="Categories"
          description={ctx.categoryCount === undefined ? 'Add, edit and recolour' : `${ctx.categoryCount} ${ctx.categoryCount === 1 ? 'category' : 'categories'} · add, edit, recolour`}
        />
        <HubLink to="/assistant" icon={Icon.Sparkles} title="Ask AI" description="“How much did I spend on food this year?”" />
        <HubLink to="/insights" icon={Icon.ChartColumn} title="Insights" description="Trends, averages and your biggest expenses" />
        <HubLink to="/past-spending" icon={Icon.History} title="Past spending" description="What you spent before Monetra" />
      </div>

      {ctx.editing && <TargetDialog current={target} currency={currency} defaultPeriod="month" onClose={ctx.closeEditor} />}
    </div>
  )
}

export default More
