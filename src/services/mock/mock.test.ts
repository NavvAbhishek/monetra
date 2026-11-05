import { addDays, startOfDay } from 'date-fns'
import { DEFAULT_CATEGORIES } from '@/constant/defaultCategories'
import type { AuthUser } from '@/types/auth'
import { sumCents } from '@/utils/aggregate'
import { getPeriodRange } from '@/utils/period'
import API, { ServiceError } from '..'
import { loadDb, resetDb } from './db'
import { DEMO_EMAIL, DEMO_UID } from './seed'

const { auth, profile, categories, expenses } = API

beforeEach(() => resetDb())

const errorCode = async (promise: Promise<unknown>) => {
  try {
    await promise
  } catch (e) {
    return e instanceof ServiceError ? e.code : 'not-a-service-error'
  }
  return 'no-error'
}

const signInDemo = () => auth.auth_signIn({ email: DEMO_EMAIL, password: 'password1', keepLoggedIn: true })

describe('auth', () => {
  it('signs in the demo account with sample data', async () => {
    const user = await signInDemo()
    expect(user).toMatchObject({ uid: DEMO_UID, email: DEMO_EMAIL, name: 'Sam Perera' })
    expect((await categories.category_list(user.uid)).map((c) => c.name)).toEqual(DEFAULT_CATEGORIES.map((c) => c.name))
  })

  it('rejects short passwords', async () => {
    expect(await errorCode(auth.auth_signIn({ email: DEMO_EMAIL, password: 'short', keepLoggedIn: true }))).toBe(
      'auth/invalid-credentials',
    )
  })

  it('creates an account with sample data for an unknown email', async () => {
    const user = await auth.auth_signIn({ email: ' New.Person@Mail.com ', password: 'password1', keepLoggedIn: false })
    expect(user.email).toBe('new.person@mail.com')
    expect(user.name).toBe('New Person')
    const week = await expenses.expense_listInRange(user.uid, getPeriodRange('week', new Date()))
    expect(week.length).toBeGreaterThan(0)
    // same email again → same account
    const again = await auth.auth_signIn({ email: 'new.person@mail.com', password: 'password1', keepLoggedIn: true })
    expect(again.uid).toBe(user.uid)
  })

  it('sign-up creates an empty account with the 6 default categories', async () => {
    const user = await auth.auth_signUp({ name: 'Ana', email: 'ana@mail.com', password: 'password1', currency: 'LKR' })
    expect(await profile.profile_get(user.uid)).toMatchObject({ name: 'Ana', currency: 'LKR' })
    expect(await categories.category_list(user.uid)).toHaveLength(6)
    expect(await expenses.expense_listInRange(user.uid, { start: new Date(2000, 0, 1), end: new Date(2100, 0, 1) })).toEqual([])
  })

  it('sign-up rejects an existing email', async () => {
    expect(
      await errorCode(auth.auth_signUp({ name: 'X', email: DEMO_EMAIL.toUpperCase(), password: 'password1', currency: 'USD' })),
    ).toBe('auth/email-in-use')
  })

  it('google signs in as the demo user', async () => {
    expect((await auth.auth_google()).email).toBe(DEMO_EMAIL)
  })

  it('reports session changes to listeners, starting with the current state', async () => {
    const seen: (AuthUser | null)[] = []
    const stop = auth.auth_onChange((u) => seen.push(u))
    await signInDemo()
    await auth.auth_signOut()
    stop()
    await signInDemo() // after unsubscribe — must not be recorded
    expect(seen.map((u) => u?.uid ?? null)).toEqual([null, DEMO_UID, null])
  })

  it('"keep me logged in" decides where the session is stored', async () => {
    await auth.auth_signIn({ email: DEMO_EMAIL, password: 'password1', keepLoggedIn: false })
    expect(sessionStorage.getItem('monetra-mock-session')).toBe(DEMO_UID)
    expect(localStorage.getItem('monetra-mock-session')).toBeNull()
    await signInDemo()
    expect(localStorage.getItem('monetra-mock-session')).toBe(DEMO_UID)
    expect(sessionStorage.getItem('monetra-mock-session')).toBeNull()
  })

  it('reset password always succeeds', async () => {
    await expect(auth.auth_resetPassword('nobody@mail.com')).resolves.toBeUndefined()
  })
})

describe('profile', () => {
  it('updates name and currency and tells auth listeners', async () => {
    await signInDemo()
    const names: (string | undefined)[] = []
    const stop = auth.auth_onChange((u) => names.push(u?.name))
    const updated = await profile.profile_update(DEMO_UID, { name: '  Samantha ', currency: 'EUR' })
    stop()
    expect(updated).toMatchObject({ name: 'Samantha', currency: 'EUR' })
    expect(names.at(-1)).toBe('Samantha')
  })

  it('unknown profile', async () => {
    expect(await profile.profile_get('nope')).toBeNull()
    expect(await errorCode(profile.profile_update('nope', { name: 'x' }))).toBe('profile/not-found')
  })

  it('profile_create is idempotent', async () => {
    const a = await profile.profile_create({ uid: 'u1', name: 'A', email: 'a@a.com', currency: 'USD' })
    const b = await profile.profile_create({ uid: 'u1', name: 'Other', email: 'a@a.com', currency: 'EUR' })
    expect(b.name).toBe(a.name)
    expect(await categories.category_list('u1')).toHaveLength(6)
  })
})

describe('categories', () => {
  it('create appends, update edits, list is ordered', async () => {
    await signInDemo()
    const created = await categories.category_create(DEMO_UID, { name: ' Pets ', emoji: '🐶', colourIndex: 4 })
    expect(created).toMatchObject({ name: 'Pets', order: 6 })
    await categories.category_update(DEMO_UID, created.id, { name: 'Pet care', emoji: '🐶', colourIndex: 1 })
    const list = await categories.category_list(DEMO_UID)
    expect(list.at(-1)).toMatchObject({ name: 'Pet care', colourIndex: 1 })
    expect(list.map((c) => c.order)).toEqual([0, 1, 2, 3, 4, 5, 6])
  })

  it('cannot delete a category that still has expenses', async () => {
    await signInDemo()
    const [food] = await categories.category_list(DEMO_UID)
    expect(await errorCode(categories.category_delete(DEMO_UID, food.id))).toBe('category/has-expenses')
  })

  it('can delete once its expenses were moved', async () => {
    await signInDemo()
    const [food, groceries] = await categories.category_list(DEMO_UID)
    const all = { start: new Date(2000, 0, 1), end: new Date(2100, 0, 1) }
    const before = await expenses.expense_listInRange(DEMO_UID, all)
    const foodCount = before.filter((e) => e.categoryId === food.id).length

    expect(await expenses.expense_reassignCategory(DEMO_UID, food.id, groceries.id)).toBe(foodCount)
    await categories.category_delete(DEMO_UID, food.id)

    expect((await categories.category_list(DEMO_UID)).some((c) => c.id === food.id)).toBe(false)
    const after = await expenses.expense_listInRange(DEMO_UID, all)
    expect(after).toHaveLength(before.length) // nothing lost
    expect(sumCents(after)).toBe(sumCents(before))
  })

  it('cannot delete the last category, or an unknown one', async () => {
    const user = await auth.auth_signUp({ name: 'A', email: 'a@a.com', password: 'password1', currency: 'USD' })
    const list = await categories.category_list(user.uid)
    for (const c of list.slice(1)) await categories.category_delete(user.uid, c.id)
    expect(await errorCode(categories.category_delete(user.uid, list[0].id))).toBe('category/last-category')
    expect(await errorCode(categories.category_delete(user.uid, 'nope'))).toBe('category/not-found')
  })
})

describe('expenses', () => {
  const draft = async (overrides = {}) => {
    const [cat] = await categories.category_list(DEMO_UID)
    return { amountCents: 1234, categoryId: cat.id, spentAt: new Date(2020, 5, 15, 10, 0), note: ' Test ', ...overrides }
  }

  beforeEach(async () => {
    await signInDemo()
  })

  it('this week has the 9 expenses from the design ($194.50) — when the week starts on Monday', async () => {
    // Seed rows are "today … 3 days ago". Count them via the last 4 days, independent of weekday.
    const today = startOfDay(new Date())
    const list = await expenses.expense_listInRange(DEMO_UID, { start: addDays(today, -3), end: addDays(today, 1) })
    const named = list.filter((e) => e.id.startsWith('seed-') && Number(e.id.slice(5)) <= 9)
    expect(named).toHaveLength(9)
    expect(sumCents(named)).toBe(19450)
  })

  it('seed data is never in the future and the list is newest first', async () => {
    const all = await expenses.expense_listInRange(DEMO_UID, { start: new Date(2000, 0, 1), end: new Date(2100, 0, 1) })
    const now = Date.now()
    expect(all.every((e) => e.spentAt.getTime() <= now)).toBe(true)
    expect(all.length).toBeGreaterThan(200)
    for (let i = 1; i < all.length; i++) expect(all[i - 1].spentAt >= all[i].spentAt).toBe(true)
  })

  it('create → get → update → delete', async () => {
    const created = await expenses.expense_create(DEMO_UID, await draft())
    expect(created).toMatchObject({ amountCents: 1234, note: 'Test' })

    expect(await expenses.expense_get(DEMO_UID, created.id)).toMatchObject({ id: created.id })

    const updated = await expenses.expense_update(DEMO_UID, created.id, await draft({ amountCents: 999, note: 'Edited' }))
    expect(updated).toMatchObject({ id: created.id, amountCents: 999, note: 'Edited' })

    await expenses.expense_delete(DEMO_UID, created.id)
    expect(await expenses.expense_get(DEMO_UID, created.id)).toBeNull()
    expect(await errorCode(expenses.expense_delete(DEMO_UID, created.id))).toBe('expense/not-found')
  })

  it('range queries are start-inclusive and end-exclusive', async () => {
    const created = await expenses.expense_create(DEMO_UID, await draft({ spentAt: new Date(2020, 5, 15, 0, 0) }))
    const inRange = (start: Date, end: Date) => expenses.expense_listInRange(DEMO_UID, { start, end })
    expect((await inRange(new Date(2020, 5, 15), new Date(2020, 5, 16))).map((e) => e.id)).toContain(created.id)
    expect((await inRange(new Date(2020, 5, 14), new Date(2020, 5, 15))).map((e) => e.id)).not.toContain(created.id)
  })

  it('rejects invalid input', async () => {
    expect(await errorCode(expenses.expense_create(DEMO_UID, await draft({ amountCents: 0 })))).toBe('expense/invalid')
    expect(await errorCode(expenses.expense_create(DEMO_UID, await draft({ amountCents: 12.5 })))).toBe('expense/invalid')
    expect(await errorCode(expenses.expense_create(DEMO_UID, await draft({ spentAt: new Date('x') })))).toBe('expense/invalid')
    expect(await errorCode(expenses.expense_create(DEMO_UID, await draft({ categoryId: 'nope' })))).toBe('category/not-found')
    expect(await errorCode(expenses.expense_update(DEMO_UID, 'nope', await draft()))).toBe('expense/not-found')
  })

  it('returns copies — changing a result does not change the stored data', async () => {
    const created = await expenses.expense_create(DEMO_UID, await draft())
    created.amountCents = 1
    created.spentAt.setFullYear(1999)
    const stored = await expenses.expense_get(DEMO_UID, created.id)
    expect(stored?.amountCents).toBe(1234)
    expect(stored?.spentAt.getFullYear()).toBe(2020)
  })

  it('users cannot see each other’s expenses', async () => {
    const other = await auth.auth_signUp({ name: 'Ana', email: 'ana@mail.com', password: 'password1', currency: 'USD' })
    const created = await expenses.expense_create(DEMO_UID, await draft())
    expect(await expenses.expense_get(other.uid, created.id)).toBeNull()
  })
})

describe('persistence', () => {
  it('writes to localStorage and revives dates after a reload', async () => {
    await signInDemo()
    const [cat] = await categories.category_list(DEMO_UID)
    const spentAt = new Date(2021, 2, 3, 4, 5)
    const created = await expenses.expense_create(DEMO_UID, { amountCents: 500, categoryId: cat.id, spentAt, note: 'Saved' })

    // simulate a page reload: drop the in-memory copy but keep localStorage
    const raw = localStorage.getItem('monetra-mock-db')
    expect(raw).toContain('Saved')
    resetDb()
    localStorage.setItem('monetra-mock-db', raw as string)

    const reloaded = loadDb().expenses[DEMO_UID].find((e) => e.id === created.id)
    expect(reloaded?.spentAt).toBeInstanceOf(Date)
    expect(reloaded?.spentAt.getTime()).toBe(spentAt.getTime())
  })

  it('recovers from corrupted storage', async () => {
    localStorage.setItem('monetra-mock-db', '{not json')
    resetDbCacheOnly()
    expect((await signInDemo()).uid).toBe(DEMO_UID)
  })
})

// resetDb() also removes storage; here we only need to drop the in-memory cache
function resetDbCacheOnly() {
  const raw = localStorage.getItem('monetra-mock-db') as string
  resetDb()
  localStorage.setItem('monetra-mock-db', raw)
}

describe('expense_countForCategory', () => {
  it('counts every expense of one category, all time', async () => {
    await signInDemo()
    const [food, groceries] = await categories.category_list(DEMO_UID)
    const all = await expenses.expense_listInRange(DEMO_UID, { start: new Date(2000, 0, 1), end: new Date(2100, 0, 1) })
    expect(await expenses.expense_countForCategory(DEMO_UID, food.id)).toBe(all.filter((e) => e.categoryId === food.id).length)
    expect(await expenses.expense_countForCategory(DEMO_UID, groceries.id)).toBeGreaterThan(0)
    expect(await expenses.expense_countForCategory(DEMO_UID, 'nope')).toBe(0)
  })
})
