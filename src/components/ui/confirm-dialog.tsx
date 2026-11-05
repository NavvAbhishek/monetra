import { AlertDialog } from 'radix-ui'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { fadeInOut, popInOut } from './overlay-classes'

export type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  /** Extra content between the description and the buttons. */
  children?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  /** danger = destructive action (red button). */
  tone?: 'danger' | 'primary'
  /** Keeps the dialog open with a spinner while the action runs. */
  loading?: boolean
  onConfirm: () => void
}

/**
 * Small "Are you sure?" pop-up for destructive actions (delete, reset).
 * Radix AlertDialog: announced as an alert, focus starts on Cancel, Esc cancels,
 * clicking outside does NOT close it — so nothing is deleted by accident.
 */
export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  tone = 'danger',
  loading = false,
  onConfirm,
}: ConfirmDialogProps) => (
  <AlertDialog.Root open={open} onOpenChange={(next) => !loading && onOpenChange(next)}>
    <AlertDialog.Portal>
      <AlertDialog.Overlay className={cn('fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-overlay p-4', fadeInOut)}>
        <AlertDialog.Content
          data-slot="confirm-dialog"
          className={cn('flex w-full max-w-100 flex-col gap-3 rounded-dialog bg-bg p-6.5 text-ink shadow-modal outline-none', popInOut)}
        >
          <AlertDialog.Title className="text-2xl font-extrabold text-ink">{title}</AlertDialog.Title>
          {description ? (
            <AlertDialog.Description className="text-base text-muted-foreground">{description}</AlertDialog.Description>
          ) : (
            <AlertDialog.Description className="sr-only">{title}</AlertDialog.Description>
          )}
          {children}
          <div className="flex justify-end gap-2.5 pt-2">
            <AlertDialog.Cancel asChild>
              <Button variant="surface" size="lg" disabled={loading}>
                {cancelLabel}
              </Button>
            </AlertDialog.Cancel>
            {/* not AlertDialog.Action: that would close the dialog before the action has finished */}
            <Button variant={tone === 'danger' ? 'danger' : 'primary'} size="lg" loading={loading} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Overlay>
    </AlertDialog.Portal>
  </AlertDialog.Root>
)
