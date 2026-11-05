import { cva, type VariantProps } from 'class-variance-authority'
import { Dialog as SheetPrimitive } from 'radix-ui'
import type { ComponentProps, ReactNode } from 'react'
import * as Icon from '@/components/icons'
import { cn } from '@/lib/utils'
import { IconButton } from './icon-button'
import { fadeInOut } from './overlay-classes'

export const Sheet = SheetPrimitive.Root
export const SheetTrigger = SheetPrimitive.Trigger
export const SheetClose = SheetPrimitive.Close

const sheetContentVariants = cva('fixed z-50 flex flex-col gap-4 text-ink outline-none', {
  variants: {
    side: {
      right:
        'inset-y-0 right-0 h-full w-full max-w-95 overflow-y-auto bg-card p-6.5 shadow-side data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right',
      bottom:
        'inset-x-0 bottom-0 max-h-svh overflow-y-auto rounded-t-sheet bg-bg px-6 pt-7 pb-8 data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom',
    },
  },
  defaultVariants: { side: 'right' },
})

export type SheetContentProps = ComponentProps<typeof SheetPrimitive.Content> &
  VariantProps<typeof sheetContentVariants>

/** Side panel (desktop) or bottom sheet (mobile). */
export const SheetContent = ({ className, side, children, ...props }: SheetContentProps) => (
  <SheetPrimitive.Portal>
    <SheetPrimitive.Overlay className={cn('fixed inset-0 z-50 bg-overlay', fadeInOut)} />
    <SheetPrimitive.Content
      data-slot="sheet-content"
      className={cn(sheetContentVariants({ side }), className)}
      {...props}
    >
      {children}
    </SheetPrimitive.Content>
  </SheetPrimitive.Portal>
)

export type SheetHeaderProps = {
  title: ReactNode
  description?: ReactNode
  showClose?: boolean
  className?: string
}

export const SheetHeader = ({ title, description, showClose = true, className }: SheetHeaderProps) => (
  <div className={cn('flex items-start justify-between gap-4', className)}>
    <div className="flex flex-col gap-1">
      <SheetPrimitive.Title className="text-2xl font-extrabold text-ink">{title}</SheetPrimitive.Title>
      {description ? (
        <SheetPrimitive.Description className="text-base text-muted-foreground">
          {description}
        </SheetPrimitive.Description>
      ) : (
        <SheetPrimitive.Description className="sr-only">{title}</SheetPrimitive.Description>
      )}
    </div>
    {showClose && (
      <SheetPrimitive.Close asChild>
        <IconButton variant="muted" aria-label="Close">
          <Icon.X aria-hidden />
        </IconButton>
      </SheetPrimitive.Close>
    )}
  </div>
)

export const SheetFooter = ({ className, ...props }: ComponentProps<'div'>) => (
  <div className={cn('mt-auto flex gap-2.5 pt-2', className)} {...props} />
)
