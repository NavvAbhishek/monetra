import { DEFAULT_THEME_COLOR, isThemeColorId, type ThemeColorId } from '@/constant/themeColors'

/**
 * Applies a theme colour to the whole app by pointing --primary at a --theme-* token on <html>.
 * The default theme removes the override so the design's exact colours are used
 * (see the `:root[data-theme-color]` block in src/index.css).
 */
export const applyThemeColor = (id: ThemeColorId | string | null | undefined): void => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const theme = isThemeColorId(id) ? id : DEFAULT_THEME_COLOR

  if (theme === DEFAULT_THEME_COLOR) {
    root.style.removeProperty('--primary')
    delete root.dataset.themeColor
  } else {
    root.style.setProperty('--primary', `var(--theme-${theme})`)
    root.dataset.themeColor = theme
  }

  // Browser UI colour (address bar on mobile) follows too.
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  const resolved = getComputedStyle(root).getPropertyValue('--primary').trim()
  if (meta && resolved) meta.content = resolved
}
