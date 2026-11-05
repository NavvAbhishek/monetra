import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type AmountInputProps = Omit<ComponentProps<'input'>, 'size' | 'type'> & {
  /** Currency symbol shown before the number. */
  symbol: string
  /** dialog = 42px number (D3) · screen = 32px number (M3). */
  size: 'dialog' | 'screen'
  invalid?: boolean
}

/** Big amount field: "$" + the number. Free text ("24.5", "1,234.50") — validated by the schema. */
export const AmountInput = ({ symbol, size, invalid, className, ...props }: AmountInputProps) => (
  <div
    className={cn(
      'flex min-w-0 items-baseline justify-end gap-0.5 font-extrabold tracking-tight text-ink',
      size === 'dialog' ? 'text-hero' : 'text-5xl',
    )}
  >
    <span aria-hidden className="text-muted-foreground">
      {symbol}
    </span>
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      placeholder="0.00"
      aria-invalid={invalid || undefined}
      className={cn(
        'w-full min-w-0 bg-transparent text-right outline-none placeholder:font-bold placeholder:text-muted-2 aria-[invalid=true]:text-danger',
        className,
      )}
      {...props}
    />
  </div>
)
