import { QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { format } from 'date-fns'
import { useAuthListener } from '@/hooks/use-auth-listener'
import { createQueryClient } from '@/lib/query-client'
import { createAppRouter } from '@/router'
import API from '@/services'
import { resetDb } from '@/services/mock/db'
import { DEMO_UID } from '@/services/mock/seed'
import { useAuthStore } from '@/stores/auth.store'
import { totalsByCategory } from '@/utils/aggregate'
import { formatMoney } from '@/utils/money'
import { getPeriodRange } from '@/utils/period'

const Harness = ({ router }: { router: ReturnType<typeof createAppRouter> }) => {
  useAuthListener()
  return <RouterProvider router={router} />
}

const originalMatchMedia = window.matchMedia
const setMobile = (mobile: boolean) => {
  window.matchMedia = ((query: string) => ({ ...originalMatchMedia(query), matches: mobile })) as typeof window.matchMedia
}

const renderAt = async (path: string, email = 'sam@email.com') => {
  await API.auth.auth_signIn({ email, password: 'password1', keepLoggedIn: true })
  const router = createAppRouter(createMemoryHistory({ initialEntries: [path] }))
  render(
    <QueryClientProvider client={createQueryClient()}>
      <Harness router={router} />
    </QueryClientProvider>,
  )
  return router
}

const PANEL_NAME = /^(Edit|New) category$/
const findPanel = () => screen.findByRole('complementary', { name: PANEL_NAME })
const queryPanel = () => screen.queryByRole('complementary', { name: PANEL_NAME })
const h1 = (name: string) => screen.findByRole('heading', { level: 1, name })
const cardLinks = () => within(screen.getByRole('list')).getAllByRole('link').filter((l) => l.getAttribute('href') !== '/categories/new')
const monthTotals = async () => {
  const month = await API.expenses.expense_listInRange(DEMO_UID, getPeriodRange('month', new Date()))
  return new Map(totalsByCategory(month).map((t) => [t.categoryId, t]))
}

beforeEach(() => {
  resetDb()
  useAuthStore.setState({ user: null, status: 'loading' })
})
afterEach(() => {
  window.matchMedia = originalMatchMedia
  useAuthStore.getState().reset()
})

describe('desktop (D4)', () => {
  it('lists the 6 categories with this month’s totals and entry counts', async () => {
    await renderAt('/categories')
    await h1('Categories')
    expect(await screen.findByText(`6 categories · ${format(new Date(), 'MMMM')} totals`)).toBeInTheDocument()

    const links = await waitFor(() => {
      const l = cardLinks()
      expect(l).toHaveLength(6)
      return l
    })
    const totals = await monthTotals()
    const cats = await API.categories.category_list(DEMO_UID)
    await waitFor(() => {
      for (const cat of cats) {
        const t = totals.get(cat.id)
        const card = links.find((l) => l.textContent?.includes(cat.name))!
        expect(card).toHaveTextContent(formatMoney(t?.cents ?? 0))
        expect(card).toHaveTextContent(`${t?.count ?? 0} ${t?.count === 1 ? 'entry' : 'entries'}`)
      }
    })
    expect(queryPanel()).not.toBeInTheDocument() // no panel until something is selected
  })

  it('"+ New category" opens the panel and creates a category', async () => {
    const router = await renderAt('/categories')
    await userEvent.click(await screen.findByRole('link', { name: '+ New category' }))
    const panel = await findPanel()
    expect(router.state.location.pathname).toBe('/categories/new')

    await userEvent.type(within(panel).getByLabelText('Name'), 'Pets')
    await userEvent.click(within(panel).getByRole('radio', { name: '🐶' }))
    await userEvent.click(within(panel).getByRole('radio', { name: 'Blue' }))
    await userEvent.click(within(panel).getByRole('button', { name: 'Create category' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/categories'))
    expect(await screen.findByText('7 categories · ' + format(new Date(), 'MMMM') + ' totals')).toBeInTheDocument()
    const created = (await API.categories.category_list(DEMO_UID)).at(-1)
    expect(created).toMatchObject({ name: 'Pets', emoji: '🐶', colourIndex: 2 })
  })

  it('shows validation errors and does not save', async () => {
    await renderAt('/categories/new')
    const panel = await findPanel()
    await userEvent.click(within(panel).getByRole('button', { name: 'Create category' }))
    expect(await within(panel).findByText('Name is required')).toBeInTheDocument()
    expect(await API.categories.category_list(DEMO_UID)).toHaveLength(6)
  })

  it('selecting a card opens it for editing; saving renames it', async () => {
    const router = await renderAt('/categories')
    await waitFor(() => expect(cardLinks()).toHaveLength(6))
    await userEvent.click(cardLinks().find((l) => l.textContent?.includes('Food'))!)

    const panel = await findPanel()
    expect(within(panel).getByLabelText('Name')).toHaveValue('Food')
    expect(within(panel).getByText(/expenses? this month/)).toBeInTheDocument()

    await userEvent.clear(within(panel).getByLabelText('Name'))
    await userEvent.type(within(panel).getByLabelText('Name'), 'Dining')
    await userEvent.click(within(panel).getByRole('button', { name: 'Save changes' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/categories'))
    await waitFor(() => expect(cardLinks().some((l) => l.textContent?.includes('Dining'))).toBe(true))
    expect(cardLinks().some((l) => l.textContent?.includes('Food'))).toBe(false)
  })

  it('moving to another category restarts the form with that category', async () => {
    await renderAt('/categories')
    await waitFor(() => expect(cardLinks()).toHaveLength(6))
    await userEvent.click(cardLinks().find((l) => l.textContent?.includes('Food'))!)
    expect(within(await findPanel()).getByLabelText('Name')).toHaveValue('Food')
    await userEvent.click(cardLinks().find((l) => l.textContent?.includes('Groceries'))!)
    await waitFor(() => expect(within(screen.getByRole('complementary', { name: PANEL_NAME })).getByLabelText('Name')).toHaveValue('Groceries'))
  })

  it('the selected card is marked, and the close button returns to the list', async () => {
    const router = await renderAt('/categories')
    await waitFor(() => expect(cardLinks()).toHaveLength(6))
    await userEvent.click(cardLinks().find((l) => l.textContent?.includes('Bills'))!)
    await findPanel()
    expect(cardLinks().find((l) => l.textContent?.includes('Bills'))).toHaveAttribute('aria-current', 'page') // set by the router for the open category
    await userEvent.click(screen.getByRole('link', { name: 'Close panel' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/categories'))
    expect(queryPanel()).not.toBeInTheDocument()
  })

  it('deleting a category with expenses moves them to another category', async () => {
    await renderAt('/categories')
    await waitFor(() => expect(cardLinks()).toHaveLength(6))
    const [food, groceries] = await API.categories.category_list(DEMO_UID)
    const foodCount = await API.expenses.expense_countForCategory(DEMO_UID, food.id)
    const groceriesCount = await API.expenses.expense_countForCategory(DEMO_UID, groceries.id)
    expect(foodCount).toBeGreaterThan(0)

    await userEvent.click(cardLinks().find((l) => l.textContent?.includes('Food'))!)
    await userEvent.click(within(await findPanel()).getByRole('button', { name: 'Delete' }))

    const dialog = await screen.findByRole('dialog', { name: 'Delete “Food”?' })
    expect(await within(dialog).findByText(new RegExp(`${foodCount} expenses use this category`))).toBeInTheDocument()
    expect(within(dialog).getByRole('combobox', { name: 'Move them to' })).toHaveTextContent('Groceries')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Move & delete' }))

    await waitFor(() => expect(cardLinks()).toHaveLength(5))
    expect(cardLinks().some((l) => l.textContent?.includes('Food'))).toBe(false)
    // nothing lost: Groceries received Food's expenses
    expect(await API.expenses.expense_countForCategory(DEMO_UID, groceries.id)).toBe(groceriesCount + foodCount)
  })

  it('deleting a category with no expenses just asks to confirm', async () => {
    const empty = await (async () => {
      await API.auth.auth_signIn({ email: 'sam@email.com', password: 'password1', keepLoggedIn: true })
      return API.categories.category_create(DEMO_UID, { name: 'Temp', emoji: '🎁', colourIndex: 3 })
    })()
    const router = await renderAt(`/categories/${empty.id}`)
    await userEvent.click(await within(await findPanel()).findByRole('button', { name: 'Delete' }))

    const dialog = await screen.findByRole('dialog')
    expect(await within(dialog).findByText(/No expenses use this category/)).toBeInTheDocument()
    expect(within(dialog).queryByRole('combobox')).not.toBeInTheDocument()
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/categories'))
    expect((await API.categories.category_list(DEMO_UID)).some((c) => c.id === empty.id)).toBe(false)
  })

  it('the only category cannot be deleted', async () => {
    const ana = await API.auth.auth_signUp({ name: 'Ana', email: 'ana@mail.com', password: 'password1', currency: 'USD' })
    const list = await API.categories.category_list(ana.uid)
    for (const c of list.slice(1)) await API.categories.category_delete(ana.uid, c.id) // leave exactly one

    await renderAt(`/categories/${list[0].id}`, 'ana@mail.com')
    await userEvent.click(await within(await findPanel()).findByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    expect(await within(dialog).findByText(/at least one category/)).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Delete' })).toBeDisabled()
  })

  it('an unknown category shows "not found" with a way back', async () => {
    await renderAt('/categories/nope')
    expect(await screen.findByText('Category not found')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to categories' })).toHaveAttribute('href', '/categories')
    expect(queryPanel()).not.toBeInTheDocument()
  })

  it('shows a skeleton while loading', async () => {
    await renderAt('/categories')
    expect(await screen.findByRole('status', { name: 'Loading categories' })).toBeInTheDocument()
  })
})

describe('mobile (M4 / M5)', () => {
  beforeEach(() => setMobile(true))

  it('lists the categories as 2-column cards with a hint and no side panel', async () => {
    await renderAt('/categories')
    await h1('Categories')
    expect(await screen.findByText('6 categories · tap one to edit')).toBeInTheDocument()
    await waitFor(() => expect(cardLinks()).toHaveLength(6))
    expect(screen.getByRole('link', { name: 'Add category' })).toHaveAttribute('href', '/categories/new')
    expect(screen.getByRole('link', { name: 'New category' })).toHaveAttribute('href', '/categories/new')
    expect(queryPanel()).not.toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Tab bar' })).toBeInTheDocument()
  })

  it('tapping a card opens the full-screen editor (no tab bar); Save returns to the list', async () => {
    const router = await renderAt('/categories')
    await waitFor(() => expect(cardLinks()).toHaveLength(6))
    await userEvent.click(cardLinks().find((l) => l.textContent?.includes('Food'))!)

    await h1('Edit category')
    expect(screen.getByLabelText('Name')).toHaveValue('Food')
    expect(screen.queryByRole('navigation', { name: 'Tab bar' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to categories' })).toHaveAttribute('href', '/categories')

    await userEvent.clear(screen.getByLabelText('Name'))
    await userEvent.type(screen.getByLabelText('Name'), 'Dining')
    await userEvent.click(screen.getByRole('button', { name: 'Save category' }))
    await h1('Categories')
    expect(router.state.location.pathname).toBe('/categories')
    await waitFor(() => expect(cardLinks().some((l) => l.textContent?.includes('Dining'))).toBe(true))
  })

  it('creates a new category from the full-screen editor', async () => {
    await renderAt('/categories/new')
    await h1('New category')
    expect(screen.queryByRole('button', { name: 'Delete category' })).not.toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('Name'), 'Gifts')
    await userEvent.click(screen.getByRole('radio', { name: '🎁' }))
    await userEvent.click(screen.getByRole('button', { name: 'Save category' }))
    await h1('Categories')
    await waitFor(() => expect(cardLinks()).toHaveLength(7))
    expect((await API.categories.category_list(DEMO_UID)).at(-1)).toMatchObject({ name: 'Gifts', emoji: '🎁' })
  })

  it('the delete button in the editor opens the confirm dialog', async () => {
    await renderAt('/categories')
    await waitFor(() => expect(cardLinks()).toHaveLength(6))
    await userEvent.click(cardLinks().find((l) => l.textContent?.includes('Health'))!)
    await h1('Edit category')
    await userEvent.click(screen.getByRole('button', { name: 'Delete category' }))
    expect(await screen.findByRole('dialog', { name: 'Delete “Health”?' })).toBeInTheDocument()
  })
})
