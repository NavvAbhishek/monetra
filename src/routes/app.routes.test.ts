import { getDocumentTitle, getRouteLabel, routeIdToPath } from './app.routes'

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
