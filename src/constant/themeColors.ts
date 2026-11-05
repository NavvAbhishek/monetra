/**
 * Theme colours offered in Settings (CLAUDE.md §6.2). The colours themselves are tokens in
 * src/index.css (--theme-<id>); this list only names them. Class names are written in full
 * so Tailwind can see them.
 */
export const THEME_COLORS = [
  { id: 'violet', name: 'Violet', swatch: 'bg-theme-violet' },
  { id: 'indigo', name: 'Indigo', swatch: 'bg-theme-indigo' },
  { id: 'blue', name: 'Blue', swatch: 'bg-theme-blue' },
  { id: 'ocean', name: 'Ocean', swatch: 'bg-theme-ocean' },
  { id: 'teal', name: 'Teal', swatch: 'bg-theme-teal' },
  { id: 'green', name: 'Green', swatch: 'bg-theme-green' },
  { id: 'amber', name: 'Amber', swatch: 'bg-theme-amber' },
  { id: 'orange', name: 'Orange', swatch: 'bg-theme-orange' },
  { id: 'rose', name: 'Rose', swatch: 'bg-theme-rose' },
  { id: 'pink', name: 'Pink', swatch: 'bg-theme-pink' },
  { id: 'graphite', name: 'Graphite', swatch: 'bg-theme-graphite' },
] as const

export type ThemeColorId = (typeof THEME_COLORS)[number]['id']

/** The design colour (#6C4DF5). */
export const DEFAULT_THEME_COLOR: ThemeColorId = 'violet'

export const isThemeColorId = (value: unknown): value is ThemeColorId =>
  THEME_COLORS.some((t) => t.id === value)
