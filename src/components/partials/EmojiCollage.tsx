import { EmojiBox } from '@/components/ui/emoji-box'
import { cn } from '@/lib/utils'

/**
 * The tilted pastel emoji tiles on the login screens (M7 hero, D5 panel).
 * Class names are written out in full so Tailwind can see them; sizes follow the design
 * (rounded to the nearest token).
 */
type Tile = { emoji: string; tone: number; box: string }

const COMPACT: Tile[] = [
  { emoji: '🍔', tone: 0, box: 'absolute top-6.5 left-8.5 size-19 -rotate-8 rounded-table text-emoji-xl' },
  { emoji: '🛒', tone: 1, box: 'absolute top-1.5 left-37.5 size-16 rotate-6 rounded-tile text-emoji-lg' },
  { emoji: '🏠', tone: 3, box: 'absolute top-10 right-9 size-20 rotate-10 rounded-table text-emoji-xl' },
  { emoji: '🚌', tone: 5, box: 'absolute top-29.5 left-25 size-14.5 rotate-4 rounded-fab text-emoji-lg' },
  { emoji: '🎬', tone: 4, box: 'absolute top-32 right-27.5 size-15.5 -rotate-6 rounded-tile text-emoji-lg' },
]

const LARGE: Tile[] = [
  { emoji: '🍔', tone: 0, box: 'absolute top-5 left-2.5 size-30 -rotate-8 rounded-card text-emoji-3xl' },
  { emoji: '🛒', tone: 1, box: 'absolute top-0 left-42.5 size-24 rotate-6 rounded-dialog text-emoji-2xl' },
  { emoji: '🏠', tone: 3, box: 'absolute top-10 left-77.5 size-31.5 rotate-10 rounded-sheet text-emoji-3xl' },
  { emoji: '🚌', tone: 5, box: 'absolute top-45 left-27.5 size-23 rotate-4 rounded-card text-emoji-2xl' },
  { emoji: '🎬', tone: 4, box: 'absolute top-50 left-62.5 size-25 -rotate-6 rounded-dialog text-emoji-2xl' },
]

export type EmojiCollageProps = { size: 'compact' | 'large'; className?: string }

const EmojiCollage = ({ size, className }: EmojiCollageProps) => (
  <div aria-hidden className={cn('relative', className)}>
    {(size === 'compact' ? COMPACT : LARGE).map((t) => (
      <EmojiBox key={t.emoji} emoji={t.emoji} tone={t.tone} className={t.box} />
    ))}
  </div>
)

export default EmojiCollage
