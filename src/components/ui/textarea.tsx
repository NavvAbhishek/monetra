import type { VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { fieldControlClass, fieldVariants } from './input-variants'

export type TextareaProps = ComponentProps<'textarea'> &
  Pick<VariantProps<typeof fieldVariants>, 'variant'> & { wrapperClassName?: string }

export const Textarea = ({ variant, wrapperClassName, className, rows = 3, ...props }: TextareaProps) => (
  <div
    data-slot="textarea"
    className={cn(fieldVariants({ variant, size: 'lg' }), 'h-auto items-start py-3', wrapperClassName)}
  >
    <textarea rows={rows} className={cn(fieldControlClass, 'resize-none', className)} {...props} />
  </div>
)
