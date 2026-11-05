import type { VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { iconButtonVariants } from './icon-button-variants'

export type IconButtonProps = Omit<ComponentProps<'button'>, 'aria-label'> &
  VariantProps<typeof iconButtonVariants> & {
    /** Required — icon-only buttons need an accessible name. */
    'aria-label': string
    asChild?: boolean
  }

export const IconButton = ({
  className,
  variant,
  size,
  asChild = false,
  type = 'button',
  ...props
}: IconButtonProps) => {
  const classes = cn(iconButtonVariants({ variant, size }), className)
  if (asChild) return <Slot.Root data-slot="icon-button" className={classes} {...props} />
  return <button type={type} data-slot="icon-button" className={classes} {...props} />
}
