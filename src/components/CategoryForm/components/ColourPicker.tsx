import { RadioGroup } from 'radix-ui'
import { CATEGORY_COLOURS } from '@/constant/categoryColours'
import { cn } from '@/lib/utils'

export type ColourPickerProps = {
  value: number
  onChange: (colourIndex: number) => void
  /** Swatch size: panel 34px, mobile screen 40px. */
  size: 'sm' | 'md'
  /** Background the picker sits on — the selection ring needs a matching gap colour. */
  surface: 'card' | 'bg'
  id?: string
}

/** The 6 category colours as round swatches (M5, D4). */
const ColourPicker = ({ value, onChange, size, surface, id }: ColourPickerProps) => (
  <RadioGroup.Root
    id={id}
    aria-label="Colour"
    value={String(value)}
    onValueChange={(v) => onChange(Number(v))}
    className="flex gap-2.5"
  >
    {CATEGORY_COLOURS.map((colour, i) => (
      <RadioGroup.Item
        key={colour.name}
        value={String(i)}
        aria-label={colour.name}
        className={cn(
          'cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          size === 'sm' ? 'size-8.5' : 'size-10',
          colour.swatch,
          surface === 'card' ? 'ring-offset-card' : 'ring-offset-bg',
          'data-[state=checked]:ring-2 data-[state=checked]:ring-ink data-[state=checked]:ring-offset-2',
        )}
      />
    ))}
  </RadioGroup.Root>
)

export default ColourPicker
