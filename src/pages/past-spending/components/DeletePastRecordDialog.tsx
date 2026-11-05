import { Amount } from '@/components/ui/amount'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { useDeletePastRecordMutation } from '@/queries/past-records/past-records-mutations'
import type { PastRecord } from '@/types/pastRecord'
import { formatPastPeriod } from '@/utils/pastSpending'

type Props = { record: PastRecord; currency: string; onClose: () => void; onDeleted: () => void }

/** "Delete this record?" — past records have no Undo, so ask first. */
const DeletePastRecordDialog = ({ record, currency, onClose, onDeleted }: Props) => {
  const remove = useDeletePastRecordMutation()
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="sm">
        <DialogHeader title="Delete this record?" />
        <p className="text-base text-muted-foreground">
          <Amount cents={record.amountCents} currency={currency} className="text-ink" /> for {formatPastPeriod(record)} will be removed
          from your all-time total. This can’t be undone.
        </p>
        <DialogFooter className="justify-end">
          <DialogClose asChild>
            <Button variant="surface" size="lg">
              Cancel
            </Button>
          </DialogClose>
          <Button variant="danger" size="lg" loading={remove.isPending} onClick={() => remove.mutate(record.id, { onSuccess: onDeleted })}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeletePastRecordDialog
