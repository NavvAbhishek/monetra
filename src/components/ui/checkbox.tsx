import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'
import * as Icon from '@/components/icons'
import { cn } from '@/lib/utils'

/** 20px rounded checkbox ("Keep me logged in", D5). Pair with <Label htmlFor>. */
export const Checkbox = ({ className, ...props }: ComponentProps<typeof CheckboxPrimitive.Root>) => (
  <CheckboxPrimitive.Root
    data-slot="checkbox"
    className={cn(
      'peer grid size-5 shrink-0 cursor-pointer place-items-center rounded-check border-2 border-line bg-card text-primary-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger data-[state=checked]:border-primary data-[state=checked]:bg-primary',
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator>
      <Icon.Check className="size-3.5" strokeWidth={3} aria-hidden />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
)
