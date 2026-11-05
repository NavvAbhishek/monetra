import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import AllTimeSummary from './components/AllTimeSummary'
import DeletePastRecordDialog from './components/DeletePastRecordDialog'
import PastRecordDialog from './components/PastRecordDialog'
import PastRecordList from './components/PastRecordList'
import { usePastSpending } from './hooks/usePastSpending'

/**
 * Past spending — money spent before Monetra (e.g. from an old app) and the all-time total.
 * These records are NEVER shown on the dashboard, expenses or categories pages (CLAUDE.md §7.5).
 */
const PastSpending = () => {
  const ctx = usePastSpending()

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Past spending"
        description="What you spent before Monetra. Shown only here and in your all-time total — never on the dashboard."
        actions={<Button onClick={ctx.openNew}>+ Add past spending</Button>}
      />

      {ctx.isLoading ? (
        <div role="status" aria-label="Loading past spending" className="flex flex-col gap-5">
          <Skeleton className="h-52 rounded-card" />
          <Skeleton className="h-40 rounded-table" />
        </div>
      ) : ctx.isError ? (
        <EmptyState
          emoji="⚠️"
          title="Couldn’t load your past spending"
          description="Check your connection and try again."
          action={<Button onClick={ctx.retry}>Try again</Button>}
        />
      ) : (
        <>
          <AllTimeSummary ctx={ctx} />
          <PastRecordList ctx={ctx} />
        </>
      )}

      {ctx.dialog.kind !== 'closed' && (
        <PastRecordDialog
          key={ctx.dialog.kind === 'edit' ? ctx.dialog.record.id : 'new'}
          record={ctx.dialog.kind === 'edit' ? ctx.dialog.record : undefined}
          categories={ctx.categories}
          currency={ctx.currency}
          firstTrackedAt={ctx.firstTrackedAt}
          onClose={ctx.closeDialog}
          onDelete={(record) => {
            ctx.closeDialog()
            ctx.askDelete(record)
          }}
        />
      )}
      {ctx.toDelete && (
        <DeletePastRecordDialog record={ctx.toDelete} currency={ctx.currency} onClose={ctx.closeDelete} onDeleted={ctx.closeDelete} />
      )}
    </div>
  )
}

export default PastSpending
