import type { Category } from '@/types/category'
import type { Expense } from '@/types/expense'
import { CSV_HEADER, escapeCsvCell, expensesToCsv } from './csv'

const when = (day: number, h: number, m = 0) => new Date(2026, 10, day, h, m)
const category = (id: string, name: string): Category => ({
  id,
  name,
  emoji: '🍔',
  colourIndex: 0,
  order: 0,
  createdAt: when(1, 0),
})
const expense = (id: string, o: Partial<Expense>): Expense => ({
  id,
  amountCents: 100,
  categoryId: 'food',
  spentAt: when(26, 12),
  note: '',
  createdAt: when(26, 12),
  updatedAt: when(26, 12),
  ...o,
})

describe('escapeCsvCell', () => {
  it('leaves simple text alone', () => {
    expect(escapeCsvCell('Lunch')).toBe('Lunch')
  })

  it('quotes commas, quotes and newlines', () => {
    expect(escapeCsvCell('a,b')).toBe('"a,b"')
    expect(escapeCsvCell('say "hi"')).toBe('"say ""hi"""')
    expect(escapeCsvCell('two\nlines')).toBe('"two\nlines"')
  })

  it.each(['=SUM(A1)', '+1', '-1', '@cmd'])('neutralises formula start %s', (value) => {
    expect(escapeCsvCell(value).startsWith("'")).toBe(true)
  })
})

describe('expensesToCsv', () => {
  const categories = [category('food', 'Food')]

  it('writes a header and rows oldest first', () => {
    const csv = expensesToCsv(
      [
        expense('b', { amountCents: 2450, note: 'Lunch with Ana', spentAt: when(26, 13, 10) }),
        expense('a', { amountCents: 200, note: 'Coffee, black', spentAt: when(24, 8, 5) }),
      ],
      categories,
      'USD',
    )
    expect(csv.split('\r\n')).toEqual([
      CSV_HEADER.join(','),
      '2026-11-24,08:05,Food,"Coffee, black",2.00,USD',
      '2026-11-26,13:10,Food,Lunch with Ana,24.50,USD',
    ])
  })

  it('handles missing categories and zero-decimal currencies', () => {
    const csv = expensesToCsv([expense('a', { categoryId: 'gone', amountCents: 500 })], categories, 'JPY')
    expect(csv.split('\r\n')[1]).toBe('2026-11-26,12:00,Uncategorised,,500,JPY')
  })

  it('is only the header when there are no expenses', () => {
    expect(expensesToCsv([], categories, 'USD')).toBe(CSV_HEADER.join(','))
  })
})
