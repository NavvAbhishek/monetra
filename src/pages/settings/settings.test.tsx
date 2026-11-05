import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import API from '@/services'
import { DEMO_UID } from '@/services/mock/seed'
import { useAuthStore } from '@/stores/auth.store'
import { useUIStore } from '@/stores/ui.store'
import { h1, renderApp, resetApp } from '@/test/app-harness'
import { CSV_HEADER } from '@/utils/csv'
import { applyThemeColor } from '@/lib/theme'
import { useThemeColor } from '@/hooks/use-theme-color'
import { renderHook } from '@testing-library/react'

/** A Settings card, once the page has rendered it. */
const section = async (title: string) =>
  (await screen.findByRole('heading', { name: title })).closest('[data-slot="card"]') as HTMLElement

beforeEach(() => {
  resetApp()
  applyThemeColor('violet')
})

describe('profile', () => {
  it('shows the user; Save is enabled only after a change', async () => {
    await renderApp('/settings')
    await h1('Settings')
    const profile = await section('Profile')
    const name = await within(profile).findByLabelText('Name')
    expect(name).toHaveValue('Sam Perera')
    expect(within(profile).getByText('sam@email.com')).toBeInTheDocument()
    const save = within(profile).getByRole('button', { name: 'Save changes' })
    expect(save).toBeDisabled()
    await userEvent.type(name, '!')
    expect(save).toBeEnabled()
  })

  it('renaming updates the profile and the sidebar', async () => {
    await renderApp('/settings')
    const profile = await section('Profile')
    const name = await within(profile).findByLabelText('Name')
    await userEvent.clear(name)
    await userEvent.type(name, 'Samantha Perera')
    await userEvent.click(within(profile).getByRole('button', { name: 'Save changes' }))

    await waitFor(async () => expect((await API.profile.profile_get(DEMO_UID))?.name).toBe('Samantha Perera'))
    await waitFor(() => expect(screen.getByRole('link', { name: 'Settings for Samantha Perera' })).toBeInTheDocument())
    expect(within(profile).getByRole('button', { name: 'Save changes' })).toBeDisabled() // clean again
  })

  it('validates the name', async () => {
    await renderApp('/settings')
    const profile = await section('Profile')
    await userEvent.clear(await within(profile).findByLabelText('Name'))
    await userEvent.click(within(profile).getByRole('button', { name: 'Save changes' }))
    expect(await within(profile).findByText('Name is required')).toBeInTheDocument()
  })

  it('changing the currency re-formats amounts across the app', async () => {
    const { router } = await renderApp('/settings')
    const profile = await section('Profile')
    await within(profile).findByLabelText('Name')
    await userEvent.click(within(profile).getByRole('combobox', { name: 'Currency' }))
    await userEvent.click(await screen.findByRole('option', { name: 'EUR · €' }))
    await userEvent.click(within(profile).getByRole('button', { name: 'Save changes' }))
    await waitFor(async () => expect((await API.profile.profile_get(DEMO_UID))?.currency).toBe('EUR'))

    await router.navigate({ to: '/' })
    await h1('Your money')
    await waitFor(() => expect(screen.getByRole('region', { name: 'You spent' })).toHaveTextContent('€'))
    expect(screen.getByRole('region', { name: 'You spent' })).not.toHaveTextContent('$')
  })
})

describe('theme colour', () => {
  it('offers the default + 10 colours; picking one recolours the app and is saved', async () => {
    renderHook(() => useThemeColor()) // what App.tsx mounts
    await renderApp('/settings')
    const theme = await section('Theme colour')
    const swatches = within(theme).getAllByRole('radio')
    expect(swatches).toHaveLength(11)
    expect(within(theme).getByRole('radio', { name: 'Violet (default)' })).toBeChecked()

    await userEvent.click(within(theme).getByRole('radio', { name: 'Teal' }))
    expect(within(theme).getByRole('radio', { name: 'Teal' })).toBeChecked()
    expect(useUIStore.getState().themeColor).toBe('teal')
    expect(JSON.parse(localStorage.getItem('monetra-ui') ?? '{}').state.themeColor).toBe('teal')
  })

  it('"Reset to default" goes back to violet', async () => {
    await renderApp('/settings')
    const theme = await section('Theme colour')
    expect(within(theme).queryByRole('button', { name: 'Reset to default' })).not.toBeInTheDocument()
    await userEvent.click(within(theme).getByRole('radio', { name: 'Rose' }))
    await userEvent.click(within(theme).getByRole('button', { name: 'Reset to default' }))
    expect(useUIStore.getState().themeColor).toBe('violet')
  })

  it('the theme hook applies the stored colour to <html>', () => {
    useUIStore.setState({ themeColor: 'green' })
    renderHook(() => useThemeColor())
    expect(document.documentElement.dataset.themeColor).toBe('green')
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('var(--theme-green)')
  })
})

describe('data + account', () => {
  it('"Download CSV" exports every expense', async () => {
    let blob: Blob | undefined
    const create = vi.fn((b: Blob) => {
      blob = b
      return 'blob:csv'
    })
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: vi.fn() })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    await renderApp('/settings')
    await userEvent.click(within(await section('Your data')).getByRole('button', { name: 'Download CSV' }))
    await waitFor(() => expect(create).toHaveBeenCalledOnce())
    expect(click).toHaveBeenCalledOnce()

    const text = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.readAsText(blob as Blob)
    })
    const lines = text.replace(/^﻿/, '').split('\r\n')
    expect(lines[0]).toBe(CSV_HEADER.join(','))
    const all = await API.expenses.expense_listInRange(DEMO_UID, { start: new Date(2000, 0, 1), end: new Date(2100, 0, 1) })
    expect(lines).toHaveLength(all.length + 1)
    expect(await screen.findByText(`Exported ${all.length} expenses`)).toBeInTheDocument()
    click.mockRestore()
  })

  it('Log out returns to the login page', async () => {
    const { router } = await renderApp('/settings')
    await userEvent.click(within(await section('Account')).getByRole('button', { name: 'Log out' }))
    await h1('Welcome back')
    expect(router.state.location.pathname).toBe('/login')
    expect(useAuthStore.getState().status).toBe('signedOut')
  })

  it('"Reset demo data" wipes changes and logs out', async () => {
    await API.auth.auth_signIn({ email: 'sam@email.com', password: 'password1', keepLoggedIn: true })
    await API.categories.category_create(DEMO_UID, { name: 'Temp', emoji: '🎁', colourIndex: 1 })
    await renderApp('/settings')
    await userEvent.click(within(await section('Your data')).getByRole('button', { name: 'Reset demo data' }))
    await h1('Welcome back')
    await API.auth.auth_signIn({ email: 'sam@email.com', password: 'password1', keepLoggedIn: true })
    expect((await API.categories.category_list(DEMO_UID)).some((c) => c.name === 'Temp')).toBe(false)
  })
})

describe('polish (Phase 10)', () => {
  it('a "Skip to content" link targets the main area', async () => {
    await renderApp('/settings')
    await h1('Settings')
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main')
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main')
  })

  it('page changes are announced to screen readers', async () => {
    const { router } = await renderApp('/settings')
    await h1('Settings')
    await router.navigate({ to: '/categories' })
    await h1('Categories')
    await waitFor(() => expect(screen.getByText('Categories · Monetra')).toHaveAttribute('aria-live', 'polite'))
  })
})
