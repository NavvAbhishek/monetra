/**
 * Category colour palette (CLAUDE.md §6). colourIndex 0–5 → Tailwind classes.
 * Colours themselves live in src/index.css (--cat-N-soft / --cat-N-strong).
 * Class names are written out in full so Tailwind can see them.
 */
export type CategoryColour = {
  /** Accessible name in the colour picker. */
  name: string
  /** Soft background (tiles, badges, emoji boxes). */
  softBg: string
  /** Strong text colour (percentages on tiles). */
  strongText: string
  /** Strong fill (category breakdown bars). */
  strongBg: string
  /** Strong stroke (donut chart slices). */
  strongStroke: string
  /** Swatch for the colour picker. */
  swatch: string
}

export const CATEGORY_COLOURS: readonly CategoryColour[] = [
  { name: 'Peach', softBg: 'bg-cat-0-soft', strongText: 'text-cat-0-strong', strongBg: 'bg-cat-0-strong', strongStroke: 'stroke-cat-0-strong', swatch: 'bg-cat-0-soft' },
  { name: 'Mint', softBg: 'bg-cat-1-soft', strongText: 'text-cat-1-strong', strongBg: 'bg-cat-1-strong', strongStroke: 'stroke-cat-1-strong', swatch: 'bg-cat-1-soft' },
  { name: 'Blue', softBg: 'bg-cat-2-soft', strongText: 'text-cat-2-strong', strongBg: 'bg-cat-2-strong', strongStroke: 'stroke-cat-2-strong', swatch: 'bg-cat-2-soft' },
  { name: 'Butter', softBg: 'bg-cat-3-soft', strongText: 'text-cat-3-strong', strongBg: 'bg-cat-3-strong', strongStroke: 'stroke-cat-3-strong', swatch: 'bg-cat-3-soft' },
  { name: 'Lilac', softBg: 'bg-cat-4-soft', strongText: 'text-cat-4-strong', strongBg: 'bg-cat-4-strong', strongStroke: 'stroke-cat-4-strong', swatch: 'bg-cat-4-soft' },
  { name: 'Aqua', softBg: 'bg-cat-5-soft', strongText: 'text-cat-5-strong', strongBg: 'bg-cat-5-strong', strongStroke: 'stroke-cat-5-strong', swatch: 'bg-cat-5-soft' },
]

export const CATEGORY_COLOUR_COUNT = CATEGORY_COLOURS.length

/** Safe lookup — wraps out-of-range indexes so a bad value never crashes the UI. */
export const getCategoryColour = (colourIndex: number): CategoryColour => {
  const i = Number.isInteger(colourIndex) ? colourIndex : 0
  return CATEGORY_COLOURS[((i % CATEGORY_COLOUR_COUNT) + CATEGORY_COLOUR_COUNT) % CATEGORY_COLOUR_COUNT]
}
