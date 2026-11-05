import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { toneBg, type Tone } from './tone'

/**
 * Pastel category tile.
 * sm = category picker in the expense form (D3, 78px), md = dashboard tiles (M1),
 * lg = categories grid (D4, 158px). `dashed` = "+ New category".
 */
const tileVariants = cva('flex flex-col text-left transition outline-none', {
  variants: {
    size: {
      sm: 'h-19.5 items-center justify-center gap-0.5 rounded-fab px-1 text-center',
      md: 'gap-0.5 rounded-tile px-3.5 py-3',
      lg: 'min-h-39.5 gap-1 rounded-card p-4.5',
    },
    selected: {
      true: 'ring-2 ring-primary',
      false: '',
    },
    interactive: {
      true: 'cursor-pointer hover:brightness-95 focus-visible:ring-2 focus-visible:ring-ring',
      false: '',
    },
    dashed: {
      true: 'items-center justify-center border-2 border-dashed border-line-strong bg-transparent text-center font-bold text-primary hover:bg-card',
      false: '',
    },
  },
  defaultVariants: { size: 'md', selected: false, interactive: false, dashed: false },
})

export type TileProps = ComponentProps<'div'> &
  VariantProps<typeof tileVariants> & {
    /** Category colourIndex (0–5) or a named tone. Ignored when dashed. */
    tone?: Tone
    /** Render the child (<button>, <Link>) with tile styles. */
    asChild?: boolean
  }

export const Tile = ({
  className,
  tone = 'card',
  size,
  selected,
  interactive,
  dashed,
  asChild = false,
  ...props
}: TileProps) => {
  const Comp = asChild ? Slot.Root : 'div'
  return (
    <Comp
      data-slot="tile"
      data-selected={selected || undefined}
      className={cn(!dashed && toneBg(tone), tileVariants({ size, selected, interactive, dashed }), className)}
      {...props}
    />
  )
}
