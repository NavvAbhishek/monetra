import { Separator as SeparatorPrimitive } from 'radix-ui'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type SeparatorProps = {
  orientation?: 'horizontal' | 'vertical'
  /** Text in the middle, e.g. "or" between login options. */
  label?: ReactNode
  className?: string
}

export const Separator = ({ orientation = 'horizontal', label, className }: SeparatorProps) => {
  if (label) {
    return (
      <div className={cn('flex items-center gap-2.5 text-xs text-muted-2', className)}>
        <SeparatorPrimitive.Root decorative className="h-px flex-1 bg-line" />
        <span>{label}</span>
        <SeparatorPrimitive.Root decorative className="h-px flex-1 bg-line" />
      </div>
    )
  }
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      orientation={orientation}
      className={cn(
        'shrink-0 bg-line',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
    />
  )
}
