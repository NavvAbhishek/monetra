import { getMode as getCategoriesMode, getSubtitle, pluralise } from './categories/helpers/CategoriesHelpers'
import { describeSeries, getFirstName } from './dashboard/helpers/DashboardHelpers'
import { getMode as getExpensesMode, getPeriodHeading } from './expenses/helpers/ExpensesHelpers'

describe('categories helpers', () => {
  it('mode from the URL', () => {
    expect(getCategoriesMode('/categories', undefined)).toEqual({ kind: 'list' })
    expect(getCategoriesMode('/categories/new', undefined)).toEqual({ kind: 'new' })
    expect(getCategoriesMode('/categories/abc', 'abc')).toEqual({ kind: 'edit', id: 'abc' })
  })

  it('subtitle and plurals', () => {
    expect(getSubtitle([{} as never], 'November', false)).toBe('1 category · November totals')
    expect(getSubtitle([], 'November', true)).toBe('0 categories · tap one to edit')
    expect(pluralise(1, 'entry', 'entries')).toBe('1 entry')
    expect(pluralise(3, 'expense')).toBe('3 expenses')
  })
})

describe('expenses helpers', () => {
  it('mode from the URL', () => {
    expect(getExpensesMode('/expenses', undefined)).toEqual({ kind: 'list' })
    expect(getExpensesMode('/expenses/new', undefined)).toEqual({ kind: 'new' })
    expect(getExpensesMode('/expenses/x1', 'x1')).toEqual({ kind: 'edit', id: 'x1' })
  })

  it('period heading', () => {
    expect(getPeriodHeading('week', true, 'Nov 23 – 29')).toBe('This week')
    expect(getPeriodHeading('month', false, 'October')).toBe('October')
  })
})

describe('dashboard helpers', () => {
  it('first name', () => {
    expect(getFirstName('Sam Perera')).toBe('Sam')
    expect(getFirstName('  Ana ')).toBe('Ana')
    expect(getFirstName(undefined)).toBe('there')
  })

  it('spoken chart summary', () => {
    expect(describeSeries('Nov 23 – 29', ['Mon', 'Tue'], [3820, 0], 'USD')).toBe('Spending Nov 23 – 29: Mon $38.20, Tue $0.00')
  })
})
