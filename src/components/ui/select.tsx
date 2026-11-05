import type { VariantProps } from 'class-variance-authority'
import { Select as SelectPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'
import * as Icon from '@/components/icons'
import { cn } from '@/lib/utils'
import { fieldVariants } from './input-variants'
import { menuItemClass, popInOut } from './overlay-classes'

export const Select = SelectPrimitive.Root
export const SelectGroup = SelectPrimitive.Group
export const SelectValue = SelectPrimitive.Value

export type SelectTriggerProps = ComponentProps<typeof SelectPrimitive.Trigger> &
  VariantProps<typeof fieldVariants>

/** Looks exactly like Input (same variants and sizes). */
export const SelectTrigger = ({ className, variant, size, children, ...props }: SelectTriggerProps) => (
  <SelectPrimitive.Trigger
    data-slot="select-trigger"
    className={cn(
      fieldVariants({ variant, size }),
      'cursor-pointer justify-between text-left font-semibold outline-none focus-visible:border-primary data-[placeholder]:font-normal data-[placeholder]:text-muted-2 data-[state=open]:border-primary aria-[invalid=true]:border-danger [&>span]:truncate',
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <Icon.ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
)

export const SelectContent = ({
  className,
  children,
  position = 'popper',
  sideOffset = 6,
  ...props
}: ComponentProps<typeof SelectPrimitive.Content>) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      data-slot="select-content"
      position={position}
      sideOffset={sideOffset}
      className={cn(
        'relative z-50 max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width) overflow-hidden rounded-panel bg-popover text-popover-foreground shadow-pop',
        popInOut,
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ScrollUpButton className="flex h-6 items-center justify-center text-muted-foreground">
        <Icon.ChevronUp className="size-4" aria-hidden />
      </SelectPrimitive.ScrollUpButton>
      <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      <SelectPrimitive.ScrollDownButton className="flex h-6 items-center justify-center text-muted-foreground">
        <Icon.ChevronDown className="size-4" aria-hidden />
      </SelectPrimitive.ScrollDownButton>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
)

export const SelectItem = ({ className, children, ...props }: ComponentProps<typeof SelectPrimitive.Item>) => (
  <SelectPrimitive.Item
    data-slot="select-item"
    className={cn(menuItemClass, 'pr-9 data-[state=checked]:font-bold', className)}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator className="absolute right-3 text-primary">
      <Icon.Check aria-hidden />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
)

export const SelectLabel = ({ className, ...props }: ComponentProps<typeof SelectPrimitive.Label>) => (
  <SelectPrimitive.Label
    className={cn('px-3 py-1.5 text-xs font-semibold text-muted-foreground', className)}
    {...props}
  />
)

export const SelectSeparator = ({ className, ...props }: ComponentProps<typeof SelectPrimitive.Separator>) => (
  <SelectPrimitive.Separator className={cn('mx-2 my-1 h-px bg-line', className)} {...props} />
)
