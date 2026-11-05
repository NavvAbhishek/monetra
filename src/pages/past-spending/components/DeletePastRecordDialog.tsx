import { Amount } from '@/components/ui/amount'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useDeletePastRecordMutation } from '@/queries/past-records/past-records-mutations'
import type { PastRecord } from '@/types/pastRecord'
import { formatPastPeriod } from '@/utils/pastSpending'

type Props = { record: PastRecord; currency: string; onClose: () => void; onDeleted: () => void }

/** "Delete this record?" — nothing is deleted until the user confirms. */
const DeletePastRecordDialog = ({ record, currency, onClose, onDeleted }: Props) => {
  const remove = useDeletePastRecordMutation()
  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Delete this record?"
      loading={remove.isPending}
      description={
        <>
          <Amount cents={record.amountCents} currency={currency} className="text-ink" /> for {formatPastPeriod(record)} will be removed
          from your all-time total. This can’t be undone.
        </>
      }
      onConfirm={() => remove.mutate(record.id, { onSuccess: onDeleted })}
    />
  )
}

export default DeletePastRecordDialog
