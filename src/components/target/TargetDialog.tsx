import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { FormField } from '@/components/ui/form-field'
import { fieldErrorProps } from '@/components/ui/form-field-ids'
import { Input } from '@/components/ui/input'
import { SegmentedTabs } from '@/components/ui/segmented-tabs'
import type { SpendTarget } from '@/types/profile'
import { getCurrencySymbol } from '@/utils/money'
import { useTargetEditor } from '@/hooks/use-target-editor'

type Props = {
  current: SpendTarget | undefined
  currency: string
  /** Period preselected for a new target (the dashboard tab the user is on). */
  defaultPeriod: SpendTarget['period']
  onClose: () => void
}

const PERIOD_OPTIONS = [
  { value: 'month', label: 'Monthly' },
  { value: 'week', label: 'Weekly' },
] as const

/** Set, change or remove the spending target. It repeats every week / month until changed. */
const TargetDialog = ({ current, currency, defaultPeriod, onClose }: Props) => {
  const editor = useTargetEditor(current, currency, defaultPeriod, onClose)
  const unit = editor.period === 'month' ? 'month' : 'week'
  const [confirmRemove, setConfirmRemove] = useState(false)

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="sm">
        <DialogHeader title={current ? 'Edit spending target' : 'Set a spending target'} description={`How much do you want to spend at most each ${unit}? It repeats every ${unit} until you change it.`} />
        <form
          noValidate
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            editor.save()
          }}
        >
          <SegmentedTabs variant="track" aria-label="Target period" value={editor.period} onValueChange={editor.setPeriod} options={PERIOD_OPTIONS} fullWidth />
          <FormField id="target-amount" label={`Target per ${unit}`} error={editor.error ?? undefined}>
            <Input
              id="target-amount"
              size="lg"
              inputMode="decimal"
              placeholder="e.g. 50000"
              autoFocus
              startIcon={<span className="text-base font-semibold">{getCurrencySymbol(currency)}</span>}
              value={editor.amount}
              onChange={(e) => editor.setAmount(e.target.value)}
              {...fieldErrorProps('target-amount', editor.error ?? undefined)}
            />
          </FormField>
          <DialogFooter className="justify-between">
            {editor.hasTarget ? (
              <Button type="button" variant="danger-ghost" onClick={() => setConfirmRemove(true)} disabled={editor.isSaving}>
                Remove
              </Button>
            ) : (
              <span />
            )}
            <span className="flex gap-2.5">
              <DialogClose asChild>
                <Button type="button" variant="muted">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" loading={editor.isSaving}>
                Save target
              </Button>
            </span>
          </DialogFooter>
        </form>
        <ConfirmDialog
          open={confirmRemove}
          onOpenChange={setConfirmRemove}
          title="Remove your spending target?"
          description="Your expenses stay as they are. You can set a new target any time."
          confirmLabel="Remove"
          loading={editor.isSaving}
          onConfirm={editor.remove}
        />
      </DialogContent>
    </Dialog>
  )
}

export default TargetDialog
