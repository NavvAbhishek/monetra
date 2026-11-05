import { CATEGORY_COLOURS, getCategoryColour } from './categoryColours'

describe('getCategoryColour', () => {
  it('returns the matching palette entry', () => {
    expect(getCategoryColour(0)).toBe(CATEGORY_COLOURS[0])
    expect(getCategoryColour(5).softBg).toBe('bg-cat-5-soft')
  })

  it('wraps out-of-range and invalid indexes', () => {
    expect(getCategoryColour(6)).toBe(CATEGORY_COLOURS[0])
    expect(getCategoryColour(-1)).toBe(CATEGORY_COLOURS[5])
    expect(getCategoryColour(Number.NaN)).toBe(CATEGORY_COLOURS[0])
    expect(getCategoryColour(2.5)).toBe(CATEGORY_COLOURS[0])
  })
})
