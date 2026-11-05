import { QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useAuthListener } from '@/hooks/use-auth-listener'
import { createQueryClient } from '@/lib/query-client'
import { createAppRouter } from '@/router'
import { resetDb } from '@/services/mock/db'
import { useAuthStore } from '@/stores/auth.store'

// Mirrors App.tsx: auth listener + router, on the real mock backend.
const Harness = ({ router }: { router: ReturnType<typeof createAppRouter> }) => {
  useAuthListener()
  return <RouterProvider router={router} />
}

const renderAt = async (path: string) => {
  const router = createAppRouter(createMemoryHistory({ initialEntries: [path] }))
  render(
    <QueryClientProvider client={createQueryClient()}>
      <Harness router={router} />
    </QueryClientProvider>,
  )
  return router
}

const heading = (name: string) => screen.findByRole('heading', { level: 1, name })
const type = (label: string | RegExp, text: string) => userEvent.type(screen.getByLabelText(label), text)

beforeEach(() => {
  resetDb()
  useAuthStore.setState({ user: null, status: 'loading' })
})
afterEach(() => useAuthStore.getState().reset())

describe('login', () => {
  it('shows required-field errors and does not call the backend', async () => {
    await renderAt('/login')
    await heading('Welcome back')
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
    expect(await screen.findByText('Email is required')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
    expect(useAuthStore.getState().status).toBe('signedOut')
  })

  it('rejects a malformed email', async () => {
    await renderAt('/login')
    await heading('Welcome back')
    await type('Email', 'nope')
    await type('Password', 'whatever1')
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument()
  })

  it('logs in and lands on the dashboard with the user in the sidebar', async () => {
    const router = await renderAt('/login')
    await heading('Welcome back')
    await type('Email', 'sam@email.com')
    await type('Password', 'password1')
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
    await heading('Dashboard')
    expect(router.state.location.pathname).toBe('/')
    expect(screen.getByText('Sam Perera')).toBeInTheDocument()
  })

  it('stays on the page when the password is too short', async () => {
    await renderAt('/login')
    await heading('Welcome back')
    await type('Email', 'sam@email.com')
    await type('Password', 'short')
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Log in' })).not.toHaveAttribute('aria-busy'))
    expect(screen.getByRole('heading', { level: 1, name: 'Welcome back' })).toBeInTheDocument()
    expect(useAuthStore.getState().status).toBe('signedOut')
  })

  it('"Keep me logged in" is on by default; turning it off uses the tab-only session', async () => {
    await renderAt('/login')
    await heading('Welcome back')
    const keep = screen.getByRole('checkbox', { name: 'Keep me logged in' })
    expect(keep).toBeChecked()
    await userEvent.click(keep)
    await type('Email', 'sam@email.com')
    await type('Password', 'password1')
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
    await heading('Dashboard')
    expect(sessionStorage.getItem('monetra-mock-session')).toBe('demo-sam')
    expect(localStorage.getItem('monetra-mock-session')).toBeNull()
  })

  it('Google sign-in works', async () => {
    await renderAt('/login')
    await heading('Welcome back')
    await userEvent.click(screen.getByRole('button', { name: /Continue with Google/ }))
    await heading('Dashboard')
  })

  it('links to forgot password and sign-up', async () => {
    const router = await renderAt('/login')
    await heading('Welcome back')
    expect(screen.getByRole('link', { name: 'Forgot password?' })).toHaveAttribute('href', '/forgot-password')
    await userEvent.click(screen.getByRole('link', { name: 'Create an account' }))
    await heading('Create account')
    expect(router.state.location.pathname).toBe('/signup')
  })

  it('has a show / hide password toggle', async () => {
    await renderAt('/login')
    await heading('Welcome back')
    const password = screen.getByLabelText('Password')
    expect(password).toHaveAttribute('type', 'password')
    await userEvent.click(screen.getByRole('button', { name: 'Show password' }))
    expect(password).toHaveAttribute('type', 'text')
  })

  it('a signed-in visitor never sees the login page', async () => {
    await renderAt('/login')
    await heading('Welcome back')
    await userEvent.click(screen.getByRole('button', { name: /Continue with Google/ }))
    await heading('Dashboard')
    expect(screen.queryByRole('heading', { level: 1, name: 'Welcome back' })).not.toBeInTheDocument()
  })
})

describe('sign up', () => {
  it('validates name, email and password length', async () => {
    await renderAt('/signup')
    await heading('Create account')
    await type('Email', 'bad')
    await type('Password', 'short')
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(screen.getByText('Enter a valid email address')).toBeInTheDocument()
    expect(screen.getByText('Use at least 8 characters')).toBeInTheDocument()
  })

  it('shows the strength meter while typing', async () => {
    await renderAt('/signup')
    await heading('Create account')
    expect(screen.queryByRole('meter')).not.toBeInTheDocument()

    await type('Password', 'abc')
    expect(screen.getByRole('meter', { name: 'Weak password' })).toHaveAttribute('aria-valuenow', '1')
    expect(screen.getByText('Weak password')).toBeInTheDocument()

    await userEvent.clear(screen.getByLabelText('Password'))
    await type('Password', 'Abcdefg123')
    expect(screen.getByRole('meter', { name: 'Strong password' })).toHaveAttribute('aria-valuenow', '3')
    expect(screen.getByText('Strong password')).toHaveClass('text-success')
  })

  it('defaults the currency to USD', async () => {
    await renderAt('/signup')
    await heading('Create account')
    expect(screen.getByRole('combobox', { name: 'Currency' })).toHaveTextContent('USD · $')
  })

  it('creates the account and lands on the dashboard', async () => {
    await renderAt('/signup')
    await heading('Create account')
    await type('Name', 'Ana Silva')
    await type('Email', 'ana@mail.com')
    await type('Password', 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))
    await heading('Dashboard')
    expect(screen.getByText('Ana Silva')).toBeInTheDocument()
    expect(useAuthStore.getState().user?.email).toBe('ana@mail.com')
  })

  it('marks the email field when the account already exists', async () => {
    await renderAt('/signup')
    await heading('Create account')
    await type('Name', 'Sam')
    await type('Email', 'sam@email.com')
    await type('Password', 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByText('An account with this email already exists.')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
    expect(useAuthStore.getState().status).toBe('signedOut')
  })

  it('has a Google option and a link back to log in', async () => {
    await renderAt('/signup')
    await heading('Create account')
    expect(screen.getByRole('button', { name: /Sign up with Google/ })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Log in' })[0]).toHaveAttribute('href', '/login')
  })
})

describe('forgot password', () => {
  it('validates the email', async () => {
    await renderAt('/forgot-password')
    await heading('Reset password')
    await userEvent.click(screen.getByRole('button', { name: 'Send reset link' }))
    expect(await screen.findByText('Email is required')).toBeInTheDocument()
  })

  it('confirms where the link was sent, and lets you try another email', async () => {
    await renderAt('/forgot-password')
    await heading('Reset password')
    await type('Email', 'sam@email.com')
    await userEvent.click(screen.getByRole('button', { name: 'Send reset link' }))
    await heading('Check your email')
    expect(screen.getByText('sam@email.com')).toBeInTheDocument()
    // (the layout's mobile back button has the same name, so look inside the page content only)
    const back = within(screen.getByRole('main')).getAllByRole('link', { name: 'Back to log in' })
    expect(back.every((l) => l.getAttribute('href') === '/login')).toBe(true)

    await userEvent.click(screen.getByRole('button', { name: 'Use a different email' }))
    await heading('Reset password')
  })
})
