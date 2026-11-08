import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import type { PastSpendingCtx } from '../hooks/usePastSpending'

/** First run: nothing added yet — offer the two ways to add past spending. */
const PastSpendingEmpty = ({ ctx }: { ctx: PastSpendingCtx }) => (
  <EmptyState
    emoji="🗂️"
    title="No past spending yet"
    description="Moving from another app? Add what you spent there — one by one, or import a CSV by day, week, month or year."
    action={
      <div className="flex flex-wrap justify-center gap-2.5">
        <Button onClick={ctx.openNew}>+ Add past spending</Button>
        <Button variant="outline" onClick={ctx.openImport}>
          Import from CSV
        </Button>
      </div>
    }
  />
)

export default PastSpendingEmpty
