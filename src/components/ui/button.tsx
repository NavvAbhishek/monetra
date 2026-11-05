import type { VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import type { ComponentProps } from 'react'
import * as Icon from '@/components/icons'
import { cn } from '@/lib/utils'
import { buttonVariants } from './button-variants'

export type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    /** Shows a spinner and disables the button. */
    loading?: boolean
    /** Render the child element (e.g. a <Link>) with button styles. */
    asChild?: boolean
  }

export const Button = ({
  className,
  variant,
  size,
  fullWidth,
  loading = false,
  asChild = false,
  disabled,
  type = 'button',
  children,
  ...props
}: ButtonProps) => {
  const classes = cn(buttonVariants({ variant, size, fullWidth }), className)

  if (asChild) {
    return (
      <Slot.Root data-slot="button" className={classes} {...props}>
        {children}
      </Slot.Root>
    )
  }

  return (
    <button
      type={type}
      data-slot="button"
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Icon.LoaderCircle className="animate-spin" aria-hidden />}
      {children}
    </button>
  )
}
