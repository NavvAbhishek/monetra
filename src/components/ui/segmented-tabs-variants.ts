import { cva } from 'class-variance-authority'

/**
 * track = desktop period tabs (D1): lavender track, white active pill.
 * pill  = mobile period tabs (M1) and toolbar Week/Month/Year (D2): dark active pill.
 * chips = emoji groups on a grey panel (D4): small chips, white inactive, dark active.
 * chips-muted = same on a white card (M5): grey inactive chips.
 */
export const segmentedRootVariants = cva('inline-flex items-center', {
  variants: {
    variant: {
      track: 'gap-0 rounded-icon bg-track p-1',
      pill: 'gap-1.5',
      chips: 'flex-wrap gap-1.5',
      'chips-muted': 'flex-wrap gap-1.5',
    },
    fullWidth: { true: 'flex w-full justify-between', false: '' },
  },
  defaultVariants: { variant: 'pill', fullWidth: false },
})

export const segmentedItemVariants = cva(
  'inline-flex cursor-pointer items-center justify-center font-semibold whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        track:
          'h-9.5 rounded-chip px-4.5 text-base text-muted-foreground hover:text-ink data-[state=on]:bg-card data-[state=on]:text-ink',
        pill: 'h-9 rounded-control px-3 text-base text-muted-foreground hover:text-ink data-[state=on]:bg-ink data-[state=on]:text-primary-foreground',
        chips:
          'h-6.5 rounded-tag bg-card px-2.5 text-xs text-ink hover:bg-muted data-[state=on]:bg-ink data-[state=on]:text-primary-foreground',
        'chips-muted':
          'h-7.5 rounded-chip bg-bg px-2.75 text-xs text-ink hover:bg-muted data-[state=on]:bg-ink data-[state=on]:text-primary-foreground',
      },
      size: {
        sm: 'text-sm',
        md: '',
      },
      /** Items share the row equally (mobile period tabs). */
      fullWidth: {
        true: 'min-w-0 flex-1 px-1',
        false: '',
      },
    },
    defaultVariants: { variant: 'pill', size: 'md', fullWidth: false },
  },
)
