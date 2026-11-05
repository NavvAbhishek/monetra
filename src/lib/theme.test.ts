import { applyThemeColor } from './theme'

describe('applyThemeColor', () => {
  const root = document.documentElement
  beforeEach(() => {
    document.head.innerHTML = '<meta name="theme-color" content="#6C4DF5" />'
    applyThemeColor('violet')
  })

  it('points --primary at the chosen theme token and marks <html>', () => {
    applyThemeColor('teal')
    expect(root.style.getPropertyValue('--primary')).toBe('var(--theme-teal)')
    expect(root.dataset.themeColor).toBe('teal')
  })

  it('the default theme removes the override (design colours stay exact)', () => {
    applyThemeColor('rose')
    applyThemeColor('violet')
    expect(root.style.getPropertyValue('--primary')).toBe('')
    expect(root.dataset.themeColor).toBeUndefined()
  })

  it('ignores unknown values (falls back to the default)', () => {
    applyThemeColor('neon-green')
    expect(root.dataset.themeColor).toBeUndefined()
    applyThemeColor(null)
    expect(root.style.getPropertyValue('--primary')).toBe('')
  })
})
