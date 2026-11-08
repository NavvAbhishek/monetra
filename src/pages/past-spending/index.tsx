import * as Icon from '@/components/icons'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import AllTimeSummary from './components/AllTimeSummary'
import ImportDialog from './components/ImportDialog'
import PastSpendingUnavailable from './components/PastSpendingUnavailable'
import DeletePastRecordDialog from './components/DeletePastRecordDialog'
import PastRecordDialog from './components/PastRecordDialog'
import PastSpendingEmpty from './components/PastSpendingEmpty'
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
        description="What you spent before Monetra. Add a month, a year or any date range, and see your all-time total."
        actions={
          <>
            <Button variant="outline" onClick={ctx.openImport}>
              <Icon.Upload aria-hidden />
              Import CSV
            </Button>
            <Button onClick={ctx.openNew}>+ Add past spending</Button>
          </>
        }
      />

      {ctx.isLoading ? (
        <div role="status" aria-label="Loading past spending" className="flex flex-col gap-5">
          <Skeleton className="h-52 rounded-card" />
          <Skeleton className="h-40 rounded-table" />
        </div>
      ) : ctx.isError ? (
        <PastSpendingUnavailable error={ctx.error} onRetry={ctx.retry} />
      ) : (
        <>
          <AllTimeSummary ctx={ctx} />
          {ctx.records.length === 0 && <PastSpendingEmpty ctx={ctx} />}
        </>
      )}

      {ctx.importOpen && (
        <ImportDialog
          categories={ctx.categories}
          currency={ctx.currency}
          records={ctx.records}
          firstTrackedAt={ctx.firstTrackedAt}
          onClose={ctx.closeImport}
        />
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
