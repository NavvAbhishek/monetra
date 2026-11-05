import { formatMoney, fromCents, getCurrencyDigits, toCents } from './money'

describe('toCents', () => {
  it.each([
    ['24.5', 2450],
    ['24.50', 2450],
    ['0.1', 10],
    ['1,234.56', 123456],
    ['$12', 1200],
    ['  7 ', 700],
    ['0.005', 1], // rounds half up
  ])('%s → %i', (input, cents) => {
    expect(toCents(input)).toBe(cents)
  })

  it('accepts numbers and avoids float errors', () => {
    expect(toCents(0.1 + 0.2)).toBe(30)
    expect(toCents(19.99)).toBe(1999)
  })

  it.each(['', '.', '-', 'abc', '-5', '1.2.3'])('rejects %j', (input) => {
    expect(toCents(input)).toBeNull()
  })

  it('respects zero-decimal currencies', () => {
    expect(toCents('500', 'JPY')).toBe(500)
  })
})

describe('fromCents / getCurrencyDigits', () => {
  it('converts back to major units', () => {
    expect(fromCents(2450)).toBe(24.5)
    expect(fromCents(500, 'JPY')).toBe(500)
  })

  it('falls back to 2 digits for unknown currencies', () => {
    expect(getCurrencyDigits('NOPE')).toBe(2)
  })
})

describe('formatMoney', () => {
  it('formats USD like the design', () => {
    expect(formatMoney(19450)).toBe('$194.50')
    expect(formatMoney(0)).toBe('$0.00')
    expect(formatMoney(123456789)).toBe('$1,234,567.89')
  })

  it('formats other currencies', () => {
    expect(formatMoney(2450, 'EUR')).toBe('€24.50')
    expect(formatMoney(150000, 'LKR')).toContain('1,500.00')
  })

  it('supports compact notation', () => {
    expect(formatMoney(155100, 'USD', { compact: true })).toBe('$1.6K')
  })

  it('falls back to USD for an invalid currency code', () => {
    expect(formatMoney(100, 'NOPE')).toBe('$1.00')
  })
})
