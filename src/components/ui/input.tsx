import type { VariantProps } from 'class-variance-authority'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { fieldControlClass, fieldVariants } from './input-variants'

export type InputProps = Omit<ComponentProps<'input'>, 'size'> &
  VariantProps<typeof fieldVariants> & {
    /** Icon shown before the text (e.g. search). */
    startIcon?: ReactNode
    /** Element after the text (e.g. show-password button, unit). */
    endAdornment?: ReactNode
    /** Class for the outer field box. `className` goes to the <input>. */
    wrapperClassName?: string
  }

export const Input = ({
  variant,
  size,
  startIcon,
  endAdornment,
  wrapperClassName,
  className,
  type = 'text',
  ...props
}: InputProps) => (
  <div data-slot="input" className={cn(fieldVariants({ variant, size }), wrapperClassName)}>
    {startIcon && (
      <span className="flex shrink-0 text-muted-2 [&_svg]:size-4.5" aria-hidden>
        {startIcon}
      </span>
    )}
    <input type={type} className={cn(fieldControlClass, className)} {...props} />
    {endAdornment && <span className="flex shrink-0 items-center">{endAdornment}</span>}
  </div>
)
