import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * tailwind-merge must know our custom token names (src/index.css), otherwise it mistakes
 * e.g. `text-hero` for a text COLOUR and drops it when a colour class is also present, and it
 * can't tell that `rounded-control` and `rounded-tile` conflict. Keep in sync with @theme.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['2xs', 'md', 'hero', 'display', 'emoji-sm', 'emoji-md', 'emoji-lg', 'emoji-xl', 'emoji-2xl', 'emoji-3xl'],
      radius: ['check', 'tag', 'chip', 'control', 'icon', 'panel', 'fab', 'tile', 'bar', 'table', 'card', 'dialog', 'sheet'],
      shadow: ['fab', 'modal', 'panel', 'side', 'pop', 'tabbar'],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
