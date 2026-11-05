import { cva, type VariantProps } from 'class-variance-authority'
import { Dialog as DialogPrimitive } from 'radix-ui'
import type { ComponentProps, ReactNode } from 'react'
import * as Icon from '@/components/icons'
import { cn } from '@/lib/utils'
import { IconButton } from './icon-button'
import { fadeInOut, popInOut } from './overlay-classes'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

const dialogContentVariants = cva(
  'relative flex w-full flex-col gap-4 rounded-dialog bg-bg p-6.5 text-ink shadow-modal outline-none',
  {
    variants: {
      size: {
        sm: 'max-w-100',
        md: 'max-w-135', // 540px — D3 expense modal
        lg: 'max-w-160',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

export type DialogContentProps = ComponentProps<typeof DialogPrimitive.Content> &
  VariantProps<typeof dialogContentVariants>

/** Centered modal (D3). The overlay scrolls if the content is taller than the screen. */
export const DialogContent = ({ className, size, children, ...props }: DialogContentProps) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay
      className={cn('fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-overlay p-4', fadeInOut)}
    >
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(dialogContentVariants({ size }), popInOut, className)}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Overlay>
  </DialogPrimitive.Portal>
)

export type DialogHeaderProps = {
  title: ReactNode
  description?: ReactNode
  /** Show the round close (×) button. Default true. */
  showClose?: boolean
  className?: string
}

export const DialogHeader = ({ title, description, showClose = true, className }: DialogHeaderProps) => (
  <div className={cn('flex items-start justify-between gap-4', className)}>
    <div className="flex flex-col gap-1">
      <DialogPrimitive.Title className="text-3xl font-extrabold text-ink">{title}</DialogPrimitive.Title>
      {description ? (
        <DialogPrimitive.Description className="text-base text-muted-foreground">
          {description}
        </DialogPrimitive.Description>
      ) : (
        <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
      )}
    </div>
    {showClose && (
      <DialogPrimitive.Close asChild>
        <IconButton variant="surface" aria-label="Close">
          <Icon.X aria-hidden />
        </IconButton>
      </DialogPrimitive.Close>
    )}
  </div>
)

export const DialogFooter = ({ className, ...props }: ComponentProps<'div'>) => (
  <div className={cn('flex items-center gap-2.5 pt-1', className)} {...props} />
)
