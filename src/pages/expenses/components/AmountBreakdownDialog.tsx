import { format } from 'date-fns'
import { Amount } from '@/components/ui/amount'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Link } from '@/router/navigation'
import type { Category } from '@/types/category'
import type { Expense } from '@/types/expense'

type Props = {
  expense: Expense
  category: Category | undefined
  currency: string
  onClose: () => void
}

/** Phones / tablets: the amounts an expense's total was made of, one per line, in a small pop-up. */
const AmountBreakdownDialog = ({ expense, category, currency, onClose }: Props) => {
  const parts = expense.amountParts ?? [expense.amountCents]
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="sm">
        <DialogHeader
          title={`${category?.emoji ?? '🧾'} ${expense.note || category?.name || 'Expense'}`}
          description={`${format(expense.spentAt, 'EEE, MMM d')} · ${parts.length} amounts`}
        />
        <ol className="flex flex-col rounded-table bg-card px-4.5 py-1.5">
          {parts.map((cents, i) => (
            <li key={i} className="flex items-center justify-between border-b border-line-soft py-2.5 text-base">
              <span className="text-muted-foreground">Amount {i + 1}</span>
              <Amount cents={cents} currency={currency} />
            </li>
          ))}
          <li className="flex items-center justify-between py-3 text-base font-bold text-ink">
            <span>Total</span>
            <Amount cents={expense.amountCents} currency={currency} size="md" />
          </li>
        </ol>
        <DialogFooter className="justify-end">
          <DialogClose asChild>
            <Button variant="muted">Close</Button>
          </DialogClose>
          <Button asChild>
            <Link to="/expenses/$expenseId" params={{ expenseId: expense.id }}>
              Edit
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AmountBreakdownDialog
