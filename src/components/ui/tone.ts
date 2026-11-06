import { getCategoryColour } from '@/constant/categoryColours'

/**
 * A "tone" is either a category colourIndex (0–5) or a named neutral tone.
 * Used by Tile, EmojiBox, Badge, Avatar so they all colour things the same way.
 */
export type Tone = number | 'neutral' | 'card' | 'primary' | 'success' | 'danger' | 'ink'

const NAMED_BG: Record<Exclude<Tone, number>, string> = {
  neutral: 'bg-bg text-ink',
  card: 'bg-card text-ink',
  primary: 'bg-primary-soft text-primary-hover', // AA contrast on the soft background
  success: 'bg-cat-1-soft text-success',
  danger: 'bg-danger-soft text-danger',
  ink: 'bg-ink text-primary-foreground',
}

/** Background (+ matching text) classes for a tone. */
export const toneBg = (tone: Tone): string =>
  typeof tone === 'number' ? `${getCategoryColour(tone).softBg} text-ink` : NAMED_BG[tone]

/** Strong text colour for a tone (e.g. "27%" on a category tile). */
export const toneText = (tone: Tone): string => {
  if (typeof tone === 'number') return getCategoryColour(tone).strongText
  if (tone === 'primary') return 'text-primary'
  if (tone === 'success') return 'text-success'
  if (tone === 'danger') return 'text-danger'
  return 'text-muted-foreground'
}

/** Stroke colour for SVG rings (donut chart): the strong category colour. */
export const toneStroke = (tone: Tone): string => {
  if (typeof tone === 'number') return getCategoryColour(tone).strongStroke
  if (tone === 'ink') return 'stroke-ink'
  if (tone === 'success') return 'stroke-success'
  if (tone === 'danger') return 'stroke-danger'
  if (tone === 'primary') return 'stroke-primary'
  return 'stroke-muted-2'
}

/** Solid fill for bars and meters: the strong category colour, or the named colour. */
export const toneFill = (tone: Tone): string => {
  if (typeof tone === 'number') return getCategoryColour(tone).strongBg
  if (tone === 'success') return 'bg-success'
  if (tone === 'danger') return 'bg-danger'
  if (tone === 'ink') return 'bg-ink'
  return 'bg-primary'
}
