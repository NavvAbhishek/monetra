import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

const cardVariants = cva('flex flex-col bg-card text-card-foreground', {
  variants: {
    radius: {
      card: 'rounded-card', // dashboard cards (28px)
      table: 'rounded-table', // tables, lists (24px)
      panel: 'rounded-panel', // small panels (16px)
    },
    padding: {
      none: 'p-0',
      sm: 'p-4',
      md: 'px-5.5 py-5',
      lg: 'p-6.5',
    },
  },
  defaultVariants: { radius: 'card', padding: 'md' },
})

export type CardProps = ComponentProps<'div'> & VariantProps<typeof cardVariants>

export const Card = ({ className, radius, padding, ...props }: CardProps) => (
  <div data-slot="card" className={cn(cardVariants({ radius, padding }), className)} {...props} />
)

/** Title row: title on the left, action (e.g. "See all") on the right. */
export const CardHeader = ({ className, ...props }: ComponentProps<'div'>) => (
  <div className={cn('flex items-baseline justify-between gap-3 pb-1', className)} {...props} />
)

export const CardTitle = ({ className, ...props }: ComponentProps<'h2'>) => (
  <h2 className={cn('text-xl font-bold text-ink', className)} {...props} />
)

export const CardDescription = ({ className, ...props }: ComponentProps<'p'>) => (
  <p className={cn('text-sm text-muted-foreground', className)} {...props} />
)
