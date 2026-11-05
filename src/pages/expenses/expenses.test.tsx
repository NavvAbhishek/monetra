import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { format } from 'date-fns'
import API from '@/services'
import { DEMO_UID } from '@/services/mock/seed'
import { h1, renderApp, resetApp, setMobile } from '@/test/app-harness'
import { filterExpenses, sumCents } from '@/utils/aggregate'
import { formatMoney } from '@/utils/money'
import { getPeriodRange, getPeriodSubtitle, shiftAnchor } from '@/utils/period'

const weekExpenses = () => API.expenses.expense_listInRange(DEMO_UID, getPeriodRange('week', new Date()))
const tableRows = () => within(screen.getByRole('table')).getAllByRole('row').slice(1) // minus the header row
const waitForTable = () => waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument())
const waitForRows = () => screen.findAllByTestId('swipe-row')
/** Text that may be re-rendered (optimistic row → saved row): query fresh each time. */
const waitForText = (text: string) => waitFor(() => expect(screen.getByText(text)).toBeInTheDocument())

beforeEach(() => resetApp())

describe('desktop list (D2)', () => {
  it('shows this week with entry count, total and one row per expense', async () => {
    await renderApp('/expenses')
    await h1('Expenses')
    const week = await weekExpenses()
    await waitForTable()
    expect(screen.getByText(`This week · ${week.length} entries · ${formatMoney(sumCents(week))}`)).toBeInTheDocument()
    expect(tableRows()).toHaveLength(week.length)
    expect(screen.getByText(`Showing ${week.length} of ${week.length}`)).toBeInTheDocument()
  })

  it('searching notes filters rows; no match shows a way back', async () => {
    await renderApp('/expenses')
    await waitForTable()
    const week = await weekExpenses()
    const target = week.find((e) => e.note)!
    const word = target.note.split(' ')[0]

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search notes' }), word)
    await waitFor(() => expect(tableRows()).toHaveLength(filterExpenses(week, { query: word }).length))

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search notes' }), 'zzzz')
    expect(await screen.findByText('No matches')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    await waitFor(() => expect(tableRows()).toHaveLength(week.length))
  })

  it('filters by category from the dropdown', async () => {
    await renderApp('/expenses')
    await waitForTable()
    const week = await weekExpenses()
    const [food] = await API.categories.category_list(DEMO_UID)

    await userEvent.click(screen.getByRole('combobox', { name: 'Category' }))
    await userEvent.click(await screen.findByRole('option', { name: /Food/ }))
    await waitFor(() => expect(tableRows()).toHaveLength(filterExpenses(week, { categoryId: food.id }).length))
  })

  it('steps through periods; "next" is disabled on the current one', async () => {
    await renderApp('/expenses')
    await waitForTable()
    const next = screen.getByRole('button', { name: 'Next period' })
    expect(next).toBeDisabled()

    await userEvent.click(screen.getByRole('radio', { name: 'Month' }))
    expect(await screen.findByText(/^This month · /)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Previous period' }))
    const lastMonth = shiftAnchor('month', new Date(), -1)
    const label = getPeriodSubtitle('month', getPeriodRange('month', lastMonth))
    expect(await screen.findByText(new RegExp(`^${label} · `))).toBeInTheDocument()
    expect(next).toBeEnabled()
  })

  it('adds an expense in the modal (amount field focused first)', async () => {
    const { router } = await renderApp('/expenses')
    await waitForTable()
    await userEvent.click(within(screen.getByRole('main')).getByRole('link', { name: '+ Add expense' })) // the sidebar has one too

    const dialog = await screen.findByRole('dialog', { name: 'Add expense' })
    expect(router.state.location.pathname).toBe('/expenses/new')
    await waitFor(() => expect(within(dialog).getByLabelText('Amount')).toHaveFocus())

    await userEvent.type(within(dialog).getByLabelText('Amount'), '12.34')
    await userEvent.click(within(dialog).getByRole('radio', { name: 'Health' }))
    await userEvent.type(within(dialog).getByLabelText('Note'), 'Vitamins')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Add expense' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/expenses'))
    await waitForText('Vitamins')
    const saved = (await weekExpenses()).find((e) => e.note === 'Vitamins')
    expect(saved?.amountCents).toBe(1234)
  })

  it('shows field errors and keeps the modal open', async () => {
    await renderApp('/expenses/new')
    const dialog = await screen.findByRole('dialog', { name: 'Add expense' })
    await userEvent.click(within(dialog).getByRole('button', { name: 'Add expense' }))
    expect(await within(dialog).findByText('Enter an amount greater than 0')).toBeInTheDocument()
    expect(within(dialog).getByLabelText('Amount')).toHaveAttribute('aria-invalid', 'true')
  })

  it('edits an expense from its row', async () => {
    await renderApp('/expenses')
    await waitForTable()
    const [first] = await weekExpenses()
    await userEvent.click(screen.getByRole('link', { name: `Edit ${first.note || 'expense'}` }))

    const dialog = await screen.findByRole('dialog', { name: 'Edit expense' })
    expect(within(dialog).getByLabelText('Note')).toHaveValue(first.note)
    expect(within(dialog).getByLabelText('Amount')).toHaveValue((first.amountCents / 100).toFixed(2))

    await userEvent.clear(within(dialog).getByLabelText('Note'))
    await userEvent.type(within(dialog).getByLabelText('Note'), 'Edited note')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }))
    await waitForText('Edited note')
    expect((await API.expenses.expense_get(DEMO_UID, first.id))?.note).toBe('Edited note')
  })

  it('deletes from the modal', async () => {
    const [first] = await (async () => {
      await API.auth.auth_signIn({ email: 'sam@email.com', password: 'password1', keepLoggedIn: true })
      return weekExpenses()
    })()
    const { router } = await renderApp(`/expenses/${first.id}`)
    const dialog = await screen.findByRole('dialog', { name: 'Edit expense' })
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/expenses'))
    expect(await API.expenses.expense_get(DEMO_UID, first.id)).toBeNull()
  })

  it('table delete hides the row and Undo brings it back (nothing deleted)', async () => {
    await renderApp('/expenses')
    await waitForTable()
    const week = await weekExpenses()
    const target = week.find((e) => e.note)!

    await userEvent.click(screen.getByRole('button', { name: `Delete ${target.note}` }))
    await waitFor(() => expect(tableRows()).toHaveLength(week.length - 1))
    await userEvent.click(await screen.findByRole('button', { name: 'Undo' }))

    await waitFor(() => expect(tableRows()).toHaveLength(week.length))
    expect(await API.expenses.expense_get(DEMO_UID, target.id)).not.toBeNull()
  })

  it('a pending delete is committed when you leave the page', async () => {
    const { router } = await renderApp('/expenses')
    await waitForTable()
    const target = (await weekExpenses()).find((e) => e.note)!
    await userEvent.click(screen.getByRole('button', { name: `Delete ${target.note}` }))
    await screen.findByRole('button', { name: 'Undo' })

    await router.navigate({ to: '/categories' })
    await h1('Categories')
    await waitFor(async () => expect(await API.expenses.expense_get(DEMO_UID, target.id)).toBeNull())
  })

  it('the delete is committed after the 5 s undo window', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      await renderApp('/expenses')
      await waitForTable()
      const target = (await weekExpenses()).find((e) => e.note)!
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      await user.click(screen.getByRole('button', { name: `Delete ${target.note}` }))
      expect(await API.expenses.expense_get(DEMO_UID, target.id)).not.toBeNull() // not yet
      vi.advanceTimersByTime(5000)
      await waitFor(async () => expect(await API.expenses.expense_get(DEMO_UID, target.id)).toBeNull())
    } finally {
      vi.useRealTimers()
    }
  })

  it('an unknown expense shows "not found" in the modal', async () => {
    await renderApp('/expenses/nope')
    const dialog = await screen.findByRole('dialog', { name: 'Edit expense' })
    expect(await within(dialog).findByText('Expense not found')).toBeInTheDocument()
  })
})

describe('mobile (M2 / M3)', () => {
  beforeEach(() => setMobile(true))

  it('groups the week by day with day totals; tab bar visible', async () => {
    await renderApp('/expenses')
    await h1('Expenses')
    const week = await weekExpenses()
    const todayLabel = `Today · ${format(new Date(), 'EEE, MMM d')}`
    const today = await screen.findByRole('region', { name: todayLabel })
    const todays = week.filter((e) => format(e.spentAt, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
    expect(within(today).getByText(formatMoney(sumCents(todays)))).toBeInTheDocument()
    expect(within(today).getAllByRole('listitem')).toHaveLength(todays.length)
    expect(screen.getByText(`This week · ${formatMoney(sumCents(week))}`)).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Tab bar' })).toBeInTheDocument()
  })

  it('search toggle and category chips filter the list', async () => {
    await renderApp('/expenses')
    await waitForRows()
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Search notes' }))
    expect(screen.getByRole('searchbox', { name: 'Search notes' })).toHaveFocus()

    const chips = screen.getByRole('group', { name: 'Filter by category' })
    expect(within(chips).getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(within(chips).getByRole('button', { name: /Bills/ }))
    expect(within(chips).getByRole('button', { name: /Bills/ })).toHaveAttribute('aria-pressed', 'true')
  })

  it('tapping a row opens the full-screen editor; saving returns to the list', async () => {
    const { router } = await renderApp('/expenses')
    const [first] = await weekExpenses()
    await waitForRows()
    await userEvent.click(screen.getAllByRole('link', { name: new RegExp(first.note || 'Expense') })[0])

    await h1('Edit expense')
    expect(screen.queryByRole('navigation', { name: 'Tab bar' })).not.toBeInTheDocument()
    await userEvent.clear(screen.getByLabelText('Note'))
    await userEvent.type(screen.getByLabelText('Note'), 'From my phone')
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await h1('Expenses')
    expect(router.state.location.pathname).toBe('/expenses')
    await waitForText('From my phone')
  })

  it('adds an expense from "What did you spend on?"', async () => {
    await renderApp('/expenses/new')
    await h1('What did you spend on?')
    await userEvent.click(screen.getByRole('radio', { name: 'Fun' }))
    await userEvent.type(screen.getByLabelText('How much?'), '9')
    await userEvent.type(screen.getByLabelText('Note'), 'Arcade')
    await userEvent.click(screen.getByRole('button', { name: 'Add expense' }))
    await h1('Expenses')
    await waitForText('Arcade')
  })

  it('swiping a row left reveals Edit / Delete; Delete removes it with Undo', async () => {
    await renderApp('/expenses')
    const week = await weekExpenses()
    const rows = await screen.findAllByTestId('swipe-row')
    const row = rows[0]

    fireEvent.pointerDown(row, { clientX: 300, pointerId: 1 })
    fireEvent.pointerMove(row, { clientX: 220, pointerId: 1 })
    fireEvent.pointerMove(row, { clientX: 150, pointerId: 1 })
    fireEvent.pointerUp(row, { clientX: 150, pointerId: 1 })
    await waitFor(() => expect(row).toHaveAttribute('data-open', 'true'))

    const li = row.closest('li') as HTMLElement
    await userEvent.click(within(li).getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(screen.getAllByTestId('swipe-row')).toHaveLength(week.length - 1))
    expect(await screen.findByRole('button', { name: 'Undo' })).toBeInTheDocument()
  })

  it('a short drag is a tap, a swipe back closes the row', async () => {
    await renderApp('/expenses')
    const [row] = await screen.findAllByTestId('swipe-row')
    fireEvent.pointerDown(row, { clientX: 300, pointerId: 1 })
    fireEvent.pointerMove(row, { clientX: 280, pointerId: 1 }) // under half the actions' width
    fireEvent.pointerUp(row, { clientX: 280, pointerId: 1 })
    await waitFor(() => expect(row).not.toHaveAttribute('data-open'))
  })
})
