import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { addDays, format, startOfDay } from 'date-fns'
import API from '@/services'
import { DEMO_UID } from '@/services/mock/seed'
import { useUIStore } from '@/stores/ui.store'
import { h1, renderApp, resetApp, setMobile } from '@/test/app-harness'
import type { PeriodKey } from '@/types/period'
import { compareTotals, sumCents, totalsByCategory } from '@/utils/aggregate'
import { formatMoney } from '@/utils/money'
import { formatRangeLabel, getPeriodRange, getPeriodSubtitle, getPreviousPeriod, getRangeDays } from '@/utils/period'

/** What the hero card should say for a period, computed straight from the backend. */
const expected = async (period: Exclude<PeriodKey, 'range'>) => {
  const now = new Date()
  const range = getPeriodRange(period, now)
  const previous = getPreviousPeriod(period, range, now)
  const [current, before] = await Promise.all([
    API.expenses.expense_listInRange(DEMO_UID, range),
    API.expenses.expense_listInRange(DEMO_UID, previous.range),
  ])
  return {
    current,
    total: formatMoney(sumCents(current)),
    subtitle: getPeriodSubtitle(period, range, now),
    comparison: compareTotals({ currentCents: sumCents(current), previousCents: sumCents(before), period, previous, rangeDays: getRangeDays(range) }).text,
  }
}

const spentCard = () => screen.getByRole('region', { name: 'You spent' })

beforeEach(() => resetApp())

describe('desktop (D1)', () => {
  it('greets the user and shows this week’s total, subtitle and comparison', async () => {
    await renderApp('/')
    await h1('Your money')
    expect(screen.getByText('Hi Sam 👋')).toBeInTheDocument()
    const e = await expected('week')
    await waitFor(() => expect(spentCard()).toHaveTextContent(e.total))
    expect(spentCard()).toHaveTextContent(e.subtitle)
    expect(spentCard()).toHaveTextContent(e.comparison)
    expect(screen.getByRole('radio', { name: 'Week' })).toBeChecked()
  })

  it('both charts describe every bucket for screen readers', async () => {
    await renderApp('/')
    await waitFor(() => expect(screen.getAllByRole('img', { name: /^Spending / })).toHaveLength(2))
    const [line] = screen.getAllByRole('img', { name: /^Spending / })
    for (const day of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']) expect(line.getAttribute('aria-label')).toContain(day)
  })

  it('lists categories by spending with their share, and the 5 most recent expenses', async () => {
    await renderApp('/')
    const e = await expected('week')
    const totals = totalsByCategory(e.current)
    const cats = await API.categories.category_list(DEMO_UID)
    const top = cats.find((c) => c.id === totals[0].categoryId)!

    const bars = await screen.findAllByRole('progressbar')
    expect(bars).toHaveLength(totals.length)
    expect(bars[0]).toHaveAccessibleName(`${top.name}: ${totals[0].percent}% of spending`)
    expect(bars[0]).toHaveAttribute('aria-valuenow', '100') // the biggest fills the bar

    const recent = screen.getByRole('heading', { name: 'Recent expenses' }).closest('[data-slot="card"]') as HTMLElement
    expect(within(recent).getAllByRole('listitem')).toHaveLength(Math.min(5, e.current.length))
    expect(within(recent).getByRole('link', { name: 'See all' })).toHaveAttribute('href', '/expenses')
  })

  it.each(['day', 'month', 'year'] as const)('the %s tab updates the card', async (period) => {
    await renderApp('/')
    await h1('Your money')
    await userEvent.click(screen.getByRole('radio', { name: period[0].toUpperCase() + period.slice(1) }))
    const e = await expected(period)
    await waitFor(() => expect(spentCard()).toHaveTextContent(e.total))
    expect(spentCard()).toHaveTextContent(e.comparison)
    expect(useUIStore.getState().period).toBe(period) // remembered for next visit
  })

  it('Range opens the picker; a preset + Apply shows that range', async () => {
    await renderApp('/')
    await h1('Your money')
    await userEvent.click(screen.getByRole('radio', { name: 'Range' }))
    const picker = await screen.findByRole('dialog', { name: 'Select dates' })

    await userEvent.click(within(picker).getByRole('button', { name: 'Last 30 days' }))
    expect(within(picker).getByText('30 days')).toBeInTheDocument()
    await userEvent.click(within(picker).getByRole('button', { name: 'Apply' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    const today = startOfDay(new Date())
    expect(spentCard()).toHaveTextContent(formatRangeLabel(addDays(today, -29), today))
    expect(spentCard()).toHaveTextContent('Custom range · 30 days')
    expect(useUIStore.getState().customRange).toEqual({ start: format(addDays(today, -29), 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') })
    expect(screen.getByRole('radio', { name: 'Range' })).toBeChecked()
  })

  it('picking two days on the calendar makes a custom range', async () => {
    await renderApp('/')
    await h1('Your money')
    await userEvent.click(screen.getByRole('button', { name: /^Choose dates/ }))
    const picker = await screen.findByRole('dialog', { name: 'Select dates' })
    const today = startOfDay(new Date())
    const dayName = (d: Date) => format(d, 'EEEE, MMMM d, yyyy')
    const first = new Date(today.getFullYear(), today.getMonth(), 1)

    await userEvent.click(within(picker).getByRole('button', { name: dayName(first) }))
    expect(within(picker).getByRole('button', { name: 'Apply' })).toBeDisabled() // only one end yet
    await userEvent.click(within(picker).getByRole('button', { name: dayName(today) }))
    expect(within(picker).getByRole('button', { name: 'Custom' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(within(picker).getByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(spentCard()).toHaveTextContent(`Custom range · ${today.getDate()} day`))
  })

  it('future days cannot be picked', async () => {
    await renderApp('/')
    await userEvent.click(await screen.findByRole('radio', { name: 'Range' }))
    const picker = await screen.findByRole('dialog', { name: 'Select dates' })
    const tomorrow = addDays(startOfDay(new Date()), 1)
    if (tomorrow.getMonth() === new Date().getMonth()) {
      expect(within(picker).getByRole('button', { name: format(tomorrow, 'EEEE, MMMM d, yyyy') })).toBeDisabled()
    }
    expect(within(picker).getByRole('button', { name: 'Next month' })).toBeDisabled()
  })

  it('Cancel without a saved range goes back to the previous tab', async () => {
    await renderApp('/')
    await h1('Your money')
    await userEvent.click(screen.getByRole('radio', { name: 'Month' }))
    await userEvent.click(screen.getByRole('radio', { name: 'Range' }))
    const picker = await screen.findByRole('dialog', { name: 'Select dates' })
    await userEvent.click(within(picker).getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(screen.getByRole('radio', { name: 'Month' })).toBeChecked())
    expect(useUIStore.getState().period).toBe('month')
  })
})

describe('mobile (M1 / M6)', () => {
  beforeEach(() => setMobile(true))

  it('shows the card, full-width tabs and the top 4 category tiles', async () => {
    await renderApp('/')
    await h1('Your money')
    const e = await expected('week')
    await waitFor(() => expect(spentCard()).toHaveTextContent(e.total))
    expect(screen.getAllByRole('radio').map((r) => r.textContent)).toEqual(['Day', 'Week', 'Month', 'Year', 'Range'])
    expect(screen.getByRole('radio', { name: 'Range' })).toHaveClass('flex-1') // shares the row on small phones
    const tiles = screen.getByRole('heading', { name: 'Categories' }).closest('section') as HTMLElement
    expect(within(tiles).getAllByRole('listitem')).toHaveLength(Math.min(4, totalsByCategory(e.current).length))
    expect(within(tiles).getByRole('link', { name: 'Manage' })).toHaveAttribute('href', '/categories')
  })

  it('the calendar button opens the bottom sheet with "Show expenses"', async () => {
    await renderApp('/')
    await h1('Your money')
    await userEvent.click(screen.getByRole('button', { name: 'Choose dates' }))
    const sheet = await screen.findByRole('dialog', { name: 'Select dates' })
    await userEvent.click(within(sheet).getByRole('button', { name: 'This month' }))
    await userEvent.click(within(sheet).getByRole('button', { name: 'Show expenses' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(spentCard()).toHaveTextContent(`Custom range · ${new Date().getDate()} day`)
  })
})

describe('new account', () => {
  it('shows $0.00 and invites the first expense', async () => {
    await API.auth.auth_signUp({ name: 'Ana Silva', email: 'ana@mail.com', password: 'password1', currency: 'USD' })
    await renderApp('/', { email: 'ana@mail.com' })
    await h1('Your money')
    expect(screen.getByText('Hi Ana 👋')).toBeInTheDocument()
    await waitFor(() => expect(spentCard()).toHaveTextContent('$0.00'))
    expect(spentCard()).toHaveTextContent('No data for last week to compare')
    const main = screen.getByRole('main')
    expect(within(main).getAllByRole('link', { name: '+ Add expense' }).length).toBeGreaterThan(0)
    expect(screen.getByText('No spending in this period yet.')).toBeInTheDocument()
  })
})
