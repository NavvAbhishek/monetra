import { DropdownMenu as MenuPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { menuItemClass, popInOut } from './overlay-classes'

export const DropdownMenu = MenuPrimitive.Root
export const DropdownMenuTrigger = MenuPrimitive.Trigger
export const DropdownMenuGroup = MenuPrimitive.Group

export const DropdownMenuContent = ({
  className,
  sideOffset = 6,
  align = 'end',
  ...props
}: ComponentProps<typeof MenuPrimitive.Content>) => (
  <MenuPrimitive.Portal>
    <MenuPrimitive.Content
      data-slot="dropdown-menu-content"
      sideOffset={sideOffset}
      align={align}
      className={cn(
        'z-50 min-w-44 rounded-panel bg-popover p-1 text-popover-foreground shadow-pop outline-none',
        popInOut,
        className,
      )}
      {...props}
    />
  </MenuPrimitive.Portal>
)

export type DropdownMenuItemProps = ComponentProps<typeof MenuPrimitive.Item> & {
  variant?: 'default' | 'danger'
}

export const DropdownMenuItem = ({ className, variant = 'default', ...props }: DropdownMenuItemProps) => (
  <MenuPrimitive.Item
    data-slot="dropdown-menu-item"
    className={cn(
      menuItemClass,
      variant === 'danger' && 'text-danger data-[highlighted]:bg-danger-soft',
      className,
    )}
    {...props}
  />
)

export const DropdownMenuLabel = ({ className, ...props }: ComponentProps<typeof MenuPrimitive.Label>) => (
  <MenuPrimitive.Label
    className={cn('px-3 py-1.5 text-xs font-semibold text-muted-foreground', className)}
    {...props}
  />
)

export const DropdownMenuSeparator = ({
  className,
  ...props
}: ComponentProps<typeof MenuPrimitive.Separator>) => (
  <MenuPrimitive.Separator className={cn('mx-2 my-1 h-px bg-line', className)} {...props} />
)
