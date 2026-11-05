import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { toneBg, type Tone } from './tone'

const badgeVariants = cva('inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap', {
  variants: {
    size: {
      sm: 'px-2 py-0.5 text-2xs',
      md: 'px-2.5 py-1 text-xs',
    },
  },
  defaultVariants: { size: 'md' },
})

export type BadgeProps = ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    /** Category colourIndex (0–5) or a named tone. */
    tone?: Tone
  }

/** Pill label — category name in the expenses table (D2), status tags. */
export const Badge = ({ className, tone = 'primary', size, ...props }: BadgeProps) => (
  <span data-slot="badge" className={cn(toneBg(tone), badgeVariants({ size }), className)} {...props} />
)
