import { RadioGroup } from 'radix-ui'
import { useState } from 'react'
import { SegmentedTabs } from '@/components/ui/segmented-tabs'
import { EMOJI_GROUP_OPTIONS, getEmojisForGroup, type EmojiGroup } from '@/constant/emojis'
import { cn } from '@/lib/utils'

export type EmojiPickerProps = {
  value: string
  onChange: (emoji: string) => void
  /**
   * panel  — D4: grey box, 8 columns, white chips.
   * screen — M5: white card, 7 columns, grey chips.
   */
  surface: 'panel' | 'screen'
}

/** Emoji grid with All / Food / Travel / Home filter chips (M5, D4). */
const EmojiPicker = ({ value, onChange, surface }: EmojiPickerProps) => {
  const [group, setGroup] = useState<EmojiGroup>('all')
  const emojis = getEmojisForGroup(group)

  return (
    <div className={cn('flex flex-col gap-2 p-2.5', surface === 'panel' ? 'rounded-tile bg-bg' : 'rounded-table bg-card p-3')}>
      <SegmentedTabs
        aria-label="Emoji group"
        variant={surface === 'panel' ? 'chips' : 'chips-muted'}
        value={group}
        onValueChange={setGroup}
        options={EMOJI_GROUP_OPTIONS}
      />
      <RadioGroup.Root
        aria-label="Emoji"
        value={value}
        onValueChange={onChange}
        className={cn('grid gap-0.5 text-center', surface === 'panel' ? 'grid-cols-8' : 'grid-cols-7 gap-1')}
      >
        {emojis.map((emoji) => (
          <RadioGroup.Item
            key={emoji}
            value={emoji}
            aria-label={emoji}
            className={cn(
              'cursor-pointer rounded-chip py-1.5 text-emoji-md outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
              surface === 'panel'
                ? 'data-[state=checked]:bg-card data-[state=checked]:ring-2 data-[state=checked]:ring-primary'
                : 'rounded-control data-[state=checked]:bg-primary-soft',
            )}
          >
            {emoji}
          </RadioGroup.Item>
        ))}
        {emojis.length === 0 && <p className="col-span-full py-3 text-sm text-muted-foreground">No emoji here yet.</p>}
      </RadioGroup.Root>
    </div>
  )
}

export default EmojiPicker
