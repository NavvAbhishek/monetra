import { RadioGroup } from 'radix-ui'
import * as Icon from '@/components/icons'
import { THEME_COLORS, type ThemeColorId } from '@/constant/themeColors'
import { cn } from '@/lib/utils'

/** 11 round swatches; the chosen one gets a ring and a tick. Changes apply instantly. */
const ThemeColorPicker = ({ value, onChange }: { value: ThemeColorId; onChange: (id: ThemeColorId) => void }) => (
  <RadioGroup.Root
    aria-label="Theme colour"
    value={value}
    onValueChange={(v) => onChange(v as ThemeColorId)}
    className="grid grid-cols-4 gap-x-2 gap-y-4 sm:grid-cols-6 lg:grid-cols-11"
  >
    {THEME_COLORS.map((theme, i) => (
      <RadioGroup.Item
        key={theme.id}
        value={theme.id}
        aria-label={i === 0 ? `${theme.name} (default)` : theme.name}
        className="group flex cursor-pointer flex-col items-center gap-1.5 rounded-control outline-none"
      >
        <span
          className={cn(
            'grid size-10 place-items-center rounded-full text-primary-foreground ring-offset-2 ring-offset-card group-focus-visible:ring-2 group-focus-visible:ring-ring group-data-[state=checked]:ring-2 group-data-[state=checked]:ring-ink',
            theme.swatch,
          )}
        >
          <RadioGroup.Indicator>
            <Icon.Check className="size-4.5" strokeWidth={3} aria-hidden />
          </RadioGroup.Indicator>
        </span>
        <span className="text-2xs font-semibold text-muted-foreground group-data-[state=checked]:text-ink">{theme.name}</span>
      </RadioGroup.Item>
    ))}
  </RadioGroup.Root>
)

export default ThemeColorPicker
