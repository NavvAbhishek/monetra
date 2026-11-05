import { QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import { createQueryClient } from '@/lib/query-client'
import { createAppRouter } from '@/router'

const renderAt = async (path: string) => {
  const router = createAppRouter(createMemoryHistory({ initialEntries: [path] }))
  render(
    <QueryClientProvider client={createQueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  await router.load()
  return router
}

describe('route tree', () => {
  it.each([
    ['/login', 'Welcome back'],
    ['/signup', 'Create account'],
    ['/forgot-password', 'Reset password'],
    ['/', 'Dashboard'],
    ['/expenses', 'Expenses'],
    ['/expenses/new', 'Add expense'],
    ['/expenses/abc123', 'Edit expense abc123'],
    ['/categories', 'Categories'],
    ['/categories/new', 'New category'],
    ['/categories/food', 'Edit category food'],
    ['/settings', 'Settings'],
    ['/dev/ui', 'UI style guide'],
    ['/does-not-exist', 'Page not found'],
  ])('%s renders "%s"', async (path, heading) => {
    await renderAt(path)
    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument()
  })

  it('sets the document title from app.routes', async () => {
    await renderAt('/expenses')
    await screen.findByRole('heading', { level: 1, name: 'Expenses' })
    expect(document.title).toBe('Expenses · Monetra')
  })
})
