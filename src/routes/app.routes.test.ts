import { getDocumentTitle, getRouteLabel, isFullScreenMobileRoute, routeIdToPath } from './app.routes'

describe('routeIdToPath', () => {
  it.each([
    ['/_app/', '/'],
    ['/_app/expenses', '/expenses'],
    ['/_app/expenses/$expenseId', '/expenses/$expenseId'],
    ['/_auth/login', '/login'],
    ['/dev/ui', '/dev/ui'],
    ['__root__', '__root__'],
  ])('%s → %s', (id, path) => {
    expect(routeIdToPath(id)).toBe(path)
  })

  it('does not strip segments that only start with _app', () => {
    expect(routeIdToPath('/_apple/x')).toBe('/_apple/x')
  })
})

describe('getDocumentTitle', () => {
  it('uses the route label', () => {
    expect(getDocumentTitle('/_app/expenses')).toBe('Expenses · Monetra')
    expect(getDocumentTitle('/_app/')).toBe('Dashboard · Monetra')
  })

  it('falls back to the app name', () => {
    expect(getDocumentTitle(undefined)).toBe('Monetra')
    expect(getDocumentTitle('__root__')).toBe('Monetra')
  })

  it('every route has a label', () => {
    expect(getRouteLabel('/categories/$categoryId')).toBe('Edit category')
  })
})

describe('isFullScreenMobileRoute', () => {
  it('is true for the add / edit editors only', () => {
    expect(isFullScreenMobileRoute('/_app/expenses/new')).toBe(true)
    expect(isFullScreenMobileRoute('/_app/expenses/$expenseId')).toBe(true)
    expect(isFullScreenMobileRoute('/_app/categories/new')).toBe(true)
    expect(isFullScreenMobileRoute('/_app/categories/$categoryId')).toBe(true)
  })

  it('is false for list pages, unknown routes and undefined', () => {
    expect(isFullScreenMobileRoute('/_app/')).toBe(false)
    expect(isFullScreenMobileRoute('/_app/expenses')).toBe(false)
    expect(isFullScreenMobileRoute('/_app/settings')).toBe(false)
    expect(isFullScreenMobileRoute('/nope')).toBe(false)
    expect(isFullScreenMobileRoute(undefined)).toBe(false)
  })
})
