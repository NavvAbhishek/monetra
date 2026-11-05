import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { toneBg, type Tone } from './tone'

/** Emoji in a soft coloured square (table rows, lists, category header). */
const emojiBoxVariants = cva('inline-grid shrink-0 place-items-center select-none', {
  variants: {
    size: {
      sm: 'size-8 rounded-chip text-emoji-sm', // 32px — table rows
      md: 'size-10.5 rounded-icon text-emoji-md', // 42px — lists
      lg: 'size-12 rounded-panel text-emoji-lg', // 48px
      xl: 'size-19 rounded-table text-emoji-xl', // 76px — category editor header
    },
  },
  defaultVariants: { size: 'md' },
})

export type EmojiBoxProps = ComponentProps<'span'> &
  VariantProps<typeof emojiBoxVariants> & {
    emoji: string
    tone?: Tone
    /** Accessible label; omit when the text next to it already names it. */
    label?: string
  }

export const EmojiBox = ({ emoji, tone = 'neutral', size, label, className, ...props }: EmojiBoxProps) => (
  <span
    data-slot="emoji-box"
    role={label ? 'img' : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
    className={cn(toneBg(tone), emojiBoxVariants({ size }), className)}
    {...props}
  >
    {emoji}
  </span>
)
