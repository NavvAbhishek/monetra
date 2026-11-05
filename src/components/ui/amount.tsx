import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { DEFAULT_CURRENCY, formatMoney } from '@/utils/money'

const amountVariants = cva('tabular-nums whitespace-nowrap', {
  variants: {
    size: {
      sm: 'text-base font-bold', // table / list rows
      md: 'text-xl font-bold', // tiles
      lg: 'text-2xl font-extrabold', // panel header
      xl: 'text-4xl font-extrabold tracking-tight',
      hero: 'text-hero font-extrabold tracking-tight', // "You spent" (mobile)
      display: 'text-display font-extrabold tracking-tight', // "You spent" (desktop)
    },
    tone: {
      default: 'text-ink',
      muted: 'text-muted-foreground',
      inverse: 'text-primary-foreground',
      success: 'text-success',
      danger: 'text-danger',
    },
  },
  defaultVariants: { size: 'sm', tone: 'default' },
})

export type AmountProps = Omit<ComponentProps<'span'>, 'children'> &
  VariantProps<typeof amountVariants> & {
    /** Integer cents. */
    cents: number
    currency?: string
    compact?: boolean
  }

/** Formatted money. Always use this to show an amount. */
export const Amount = ({
  cents,
  currency = DEFAULT_CURRENCY,
  compact,
  size,
  tone,
  className,
  ...props
}: AmountProps) => (
  <span data-slot="amount" className={cn(amountVariants({ size, tone }), className)} {...props}>
    {formatMoney(cents, currency, { compact })}
  </span>
)
