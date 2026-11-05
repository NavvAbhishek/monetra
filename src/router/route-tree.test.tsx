import { QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createQueryClient } from '@/lib/query-client'
import { createAppRouter } from '@/router'
import { useAuthStore } from '@/stores/auth.store'

type AuthState = 'signedIn' | 'signedOut' | 'loading'

const SAM = { uid: 'u1', email: 'sam@email.com', name: 'Sam Perera', photoURL: null }

const setAuth = (state: AuthState) => {
  if (state === 'signedIn') useAuthStore.getState().setUser(SAM)
  else if (state === 'signedOut') useAuthStore.getState().setUser(null)
  else useAuthStore.setState({ user: null, status: 'loading' })
}

const renderAt = async (path: string, auth: AuthState = 'signedIn') => {
  setAuth(auth)
  const router = createAppRouter(createMemoryHistory({ initialEntries: [path] }))
  render(
    <QueryClientProvider client={createQueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  await router.load()
  return router
}

afterEach(() => useAuthStore.getState().reset())

describe('every route renders its page', () => {
  it.each([
    ['/', 'Your money'],
    ['/expenses', 'Expenses'],
    // desktop: the expenses page with the add / edit modal on top (mobile shows the full-screen editor)
    ['/expenses/new', 'Expenses'],
    ['/expenses/abc123', 'Expenses'],
    ['/categories', 'Categories'],
    // desktop: the same page with the side panel open (mobile shows the full-screen editor)
    ['/categories/new', 'Categories'],
    ['/categories/food', 'Categories'],
    ['/settings', 'Settings'],
    ['/dev/ui', 'UI style guide'],
    ['/does-not-exist', 'Page not found'],
  ])('%s (signed in) → "%s"', async (path, heading) => {
    await renderAt(path)
    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument()
  })

  it.each([
    ['/login', 'Welcome back'],
    ['/signup', 'Create account'],
    ['/forgot-password', 'Reset password'],
  ])('%s (signed out) → "%s"', async (path, heading) => {
    await renderAt(path, 'signedOut')
    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument()
  })

  it('sets the document title from app.routes', async () => {
    await renderAt('/expenses')
    await screen.findByRole('heading', { level: 1, name: 'Expenses' })
    expect(document.title).toBe('Expenses · Monetra')
  })
})

describe('route guards', () => {
  it('signed-out visitors of an app page are sent to /login', async () => {
    const router = await renderAt('/expenses', 'signedOut')
    expect(await screen.findByRole('heading', { level: 1, name: 'Welcome back' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
  })

  it('signed-in users on /login are sent to the dashboard', async () => {
    const router = await renderAt('/login', 'signedIn')
    expect(await screen.findByRole('heading', { level: 1, name: 'Your money' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/')
  })

  it('shows a spinner (and does not redirect) while the session is loading', async () => {
    const router = await renderAt('/expenses', 'loading')
    expect(await screen.findByRole('status', { name: 'Loading' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/expenses')
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  })

  it('redirects as soon as the session resolves', async () => {
    const router = await renderAt('/expenses', 'loading')
    await screen.findByRole('status', { name: 'Loading' })
    useAuthStore.getState().setUser(null) // listener reports: nobody signed in
    expect(await screen.findByRole('heading', { level: 1, name: 'Welcome back' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
  })
})

describe('app shell', () => {
  it('sidebar has the logo, add button, 3 links and the user', async () => {
    await renderAt('/')
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(within(nav).getAllByRole('link').map((l) => l.textContent)).toEqual(['Dashboard', 'Expenses', 'Categories'])
    expect(screen.getByRole('link', { name: '+ Add expense' })).toHaveAttribute('href', '/expenses/new')
    expect(screen.getByRole('link', { name: 'Settings for Sam Perera' })).toHaveAttribute('href', '/settings')
    expect(screen.getByText('Sam Perera')).toBeInTheDocument()
  })

  it('marks only the current link active ("/" matches exactly)', async () => {
    await renderAt('/')
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(within(nav).getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: 'Expenses' })).not.toHaveAttribute('aria-current')
  })

  it('keeps a section active on its sub-routes', async () => {
    await renderAt('/expenses/new')
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(within(nav).getByRole('link', { name: 'Expenses' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current')
  })

  it('clicking a link navigates', async () => {
    const router = await renderAt('/')
    await userEvent.click(within(screen.getByRole('navigation', { name: 'Main' })).getByRole('link', { name: 'Categories' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Categories' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/categories')
  })

  it('mobile tab bar: 4 tabs + the raised add button', async () => {
    await renderAt('/categories')
    const bar = screen.getByRole('navigation', { name: 'Tab bar' })
    expect(within(bar).getAllByRole('link').map((l) => l.getAttribute('aria-label'))).toEqual([
      'Dashboard',
      'Expenses',
      'Add expense',
      'Categories',
      'Settings',
    ])
    expect(within(bar).getByRole('link', { name: 'Categories' })).toHaveAttribute('aria-current', 'page')
    expect(within(bar).getByRole('link', { name: 'Add expense' })).toHaveAttribute('href', '/expenses/new')
  })

  it.each(['/expenses/new', '/expenses/abc', '/categories/new', '/categories/food'])(
    'no tab bar on the full-screen editor %s',
    async (path) => {
      await renderAt(path)
      expect(screen.queryByRole('navigation', { name: 'Tab bar' })).not.toBeInTheDocument()
    },
  )
})

describe('auth shell', () => {
  it('login shows the showcase tagline; sign-up shows the preview card and a back button', async () => {
    await renderAt('/login', 'signedOut')
    expect(screen.getByText('Every expense, sorted by what it was for.')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Back to log in' })).not.toBeInTheDocument()
  })

  it('sign-up', async () => {
    await renderAt('/signup', 'signedOut')
    expect(screen.getByText('Daily, weekly and monthly totals in one place.')).toBeInTheDocument()
    expect(screen.getByText('$194.50')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to log in' })).toHaveAttribute('href', '/login')
  })
})
