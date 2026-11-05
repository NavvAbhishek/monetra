import { cva, type VariantProps } from 'class-variance-authority'
import { Label as LabelPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

const labelVariants = cva('text-sm select-none', {
  variants: {
    variant: {
      default: 'font-semibold text-ink',
      strong: 'font-bold text-ink',
      muted: 'font-normal text-muted-foreground',
    },
  },
  defaultVariants: { variant: 'default' },
})

export type LabelProps = ComponentProps<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>

export const Label = ({ className, variant, ...props }: LabelProps) => (
  <LabelPrimitive.Root data-slot="label" className={cn(labelVariants({ variant }), className)} {...props} />
)
