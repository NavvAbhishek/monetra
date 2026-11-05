import type { VariantProps } from 'class-variance-authority'
import { ToggleGroup } from 'radix-ui'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { segmentedItemVariants, segmentedRootVariants } from './segmented-tabs-variants'

export type SegmentedOption<T extends string> = {
  value: T
  label: ReactNode
  disabled?: boolean
}

export type SegmentedTabsProps<T extends string> = VariantProps<typeof segmentedRootVariants> &
  Pick<VariantProps<typeof segmentedItemVariants>, 'size'> & {
    value: T
    onValueChange: (value: T) => void
    options: readonly SegmentedOption<T>[]
    'aria-label': string
    className?: string
  }

/** Single-choice segmented control (period tabs, emoji groups). Always keeps one value selected. */
export const SegmentedTabs = <T extends string>({
  value,
  onValueChange,
  options,
  variant,
  size,
  fullWidth,
  className,
  'aria-label': ariaLabel,
}: SegmentedTabsProps<T>) => (
  <ToggleGroup.Root
    type="single"
    data-slot="segmented-tabs"
    aria-label={ariaLabel}
    value={value}
    onValueChange={(next) => {
      if (next) onValueChange(next as T) // ignore "deselect" — one option is always active
    }}
    className={cn(segmentedRootVariants({ variant, fullWidth }), className)}
  >
    {options.map((option) => (
      <ToggleGroup.Item
        key={option.value}
        value={option.value}
        disabled={option.disabled}
        className={segmentedItemVariants({ variant, size })}
      >
        {option.label}
      </ToggleGroup.Item>
    ))}
  </ToggleGroup.Root>
)
