import { RadioGroup } from 'radix-ui'
import { Tile } from '@/components/ui/tile'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/category'

export type CategoryPickerProps = {
  categories: readonly Category[]
  value: string
  onChange: (categoryId: string) => void
  /** dialog = 6 columns (D3) · screen = phones / tablets (M3): 4 columns (5–6 on wider screens), compact tiles. */
  layout: 'dialog' | 'screen'
  id?: string
}

/** Pick one category from pastel tiles. A radio group, so arrow keys work. */
const CategoryPicker = ({ categories, value, onChange, layout, id }: CategoryPickerProps) => (
  <RadioGroup.Root
    id={id}
    aria-label="Category"
    value={value}
    onValueChange={onChange}
    className={cn('grid gap-2', layout === 'dialog' ? 'grid-cols-6' : 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6')}
  >
    {categories.map((category) => (
      <Tile
        key={category.id}
        asChild
        interactive
        size="sm"
        tone={category.colourIndex}
        selected={category.id === value}
        className={layout === 'screen' ? 'h-18 rounded-panel' : undefined}
      >
        <RadioGroup.Item value={category.id} aria-label={category.name}>
          <span className="text-emoji-lg" aria-hidden>
            {category.emoji}
          </span>
          <span className="max-w-full truncate text-xs font-semibold">
            {category.name}
          </span>
        </RadioGroup.Item>
      </Tile>
    ))}
  </RadioGroup.Root>
)

export default CategoryPicker
