import { cn } from './utils'

describe('cn (tailwind-merge with our tokens)', () => {
  it('keeps custom text sizes next to text colours', () => {
    expect(cn('text-display font-extrabold', 'text-primary-foreground')).toBe('text-display font-extrabold text-primary-foreground')
    expect(cn('text-hero', 'text-ink')).toBe('text-hero text-ink')
    expect(cn('text-emoji-lg', 'text-ink')).toBe('text-emoji-lg text-ink')
  })

  it('lets a later custom size / radius / shadow override an earlier one', () => {
    expect(cn('text-sm', 'text-hero')).toBe('text-hero')
    expect(cn('rounded-fab', 'rounded-tile')).toBe('rounded-tile')
    expect(cn('rounded-card p-4', 'rounded-table')).toBe('p-4 rounded-table')
    expect(cn('shadow-panel', 'shadow-modal')).toBe('shadow-modal')
  })
})
