import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createQueryClient } from '@/lib/query-client'
import API from '@/services'
import { resetDb } from '@/services/mock/db'
import { DEMO_UID } from '@/services/mock/seed'
import { useAuthStore } from '@/stores/auth.store'
import type { Expense } from '@/types/expense'
import { getPeriodRange } from '@/utils/period'
import { useSignOutMutation } from './auth/auth-mutations'
import { useGetCategoriesQuery } from './categories/categories-queries'
import { useDeleteCategoryMutation } from './categories/categories-mutations'
import { removeFromList, upsertInList } from './expenses/expenses-cache'
import { useCreateExpenseMutation, useDeleteExpenseMutation, useUpdateExpenseMutation } from './expenses/expenses-mutations'
import { useGetExpensesQuery } from './expenses/expenses-queries'
import { useGetProfileQuery } from './profile/profile-queries'
import { isExpenseListKey, QUERY_KEYS, rangeFromKey } from './query-keys'
import { requireUid } from './session'

const NOW = new Date()
const WEEK = getPeriodRange('week', NOW)
const at = (h: number) => {
  const d = new Date(NOW)
  d.setHours(h, 0, 0, 0)
  return d
}

let queryClient: QueryClient
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

beforeEach(async () => {
  resetDb()
  vi.restoreAllMocks()
  queryClient = createQueryClient()
  const user = await API.auth.auth_signIn({ email: 'sam@email.com', password: 'password1', keepLoggedIn: true })
  useAuthStore.getState().setUser(user)
})

afterEach(() => useAuthStore.getState().reset())

const expense = (id: string, spentAt: Date, amountCents = 100): Expense => ({
  id,
  amountCents,
  categoryId: 'c',
  spentAt,
  note: '',
  createdAt: spentAt,
  updatedAt: spentAt,
})

describe('query keys', () => {
  it('list keys round-trip the range; detail keys are not list keys', () => {
    const key = QUERY_KEYS.expenses(WEEK)
    expect(isExpenseListKey(key)).toBe(true)
    expect(rangeFromKey(key)).toEqual(WEEK)
    expect(isExpenseListKey(QUERY_KEYS.expense('x'))).toBe(false)
    expect(isExpenseListKey(QUERY_KEYS.categories)).toBe(false)
  })
})

describe('expenses-cache', () => {
  const range = { start: new Date(2026, 10, 23), end: new Date(2026, 10, 30) }
  const a = expense('a', new Date(2026, 10, 24, 9))
  const b = expense('b', new Date(2026, 10, 26, 9))

  it('upsert inserts newest first, replaces by id, and drops out-of-range items', () => {
    expect(upsertInList([a], b, range).map((e) => e.id)).toEqual(['b', 'a'])
    expect(upsertInList([a, b], { ...a, amountCents: 5 }, range).find((e) => e.id === 'a')?.amountCents).toBe(5)
    expect(upsertInList([a, b], { ...a, spentAt: new Date(2026, 11, 5) }, range).map((e) => e.id)).toEqual(['b'])
    expect(upsertInList([], expense('z', new Date(2026, 10, 1)), range)).toEqual([])
  })

  it('remove', () => {
    expect(removeFromList([a, b], 'a').map((e) => e.id)).toEqual(['b'])
  })

  it('does not mutate the input', () => {
    const list = [a, b]
    upsertInList(list, expense('c', new Date(2026, 10, 25)), range)
    removeFromList(list, 'a')
    expect(list).toHaveLength(2)
  })
})

describe('read hooks', () => {
  it('load profile, categories and this week’s expenses for the signed-in user', async () => {
    const profile = renderHook(() => useGetProfileQuery(), { wrapper })
    const cats = renderHook(() => useGetCategoriesQuery(), { wrapper })
    const list = renderHook(() => useGetExpensesQuery(WEEK), { wrapper })
    await waitFor(() => expect(profile.result.current.data?.name).toBe('Sam Perera'))
    await waitFor(() => expect(cats.result.current.data).toHaveLength(6))
    await waitFor(() => expect(list.result.current.data?.length).toBeGreaterThan(0))
  })

  it('stay idle when nobody is signed in', () => {
    useAuthStore.getState().reset()
    const cats = renderHook(() => useGetCategoriesQuery(), { wrapper })
    expect(cats.result.current.fetchStatus).toBe('idle')
  })

  it('requireUid throws when signed out', () => {
    useAuthStore.getState().reset()
    expect(() => requireUid()).toThrow(/log in/i)
  })
})

describe('expense mutations', () => {
  const setup = async () => {
    const list = renderHook(() => useGetExpensesQuery(WEEK), { wrapper })
    await waitFor(() => expect(list.result.current.data).toBeDefined())
    const [category] = await API.categories.category_list(DEMO_UID)
    return { list, category }
  }

  it('create shows the new expense IMMEDIATELY, then keeps it after the real response', async () => {
    const { list, category } = await setup()
    const before = list.result.current.data?.length ?? 0

    let release: (e: Expense) => void = () => {}
    const pending = new Promise<Expense>((resolve) => (release = resolve))
    const real = API.expenses.expense_create.bind(API.expenses)
    vi.spyOn(API.expenses, 'expense_create').mockImplementation(async (uid, input) => {
      const created = await real(uid, input)
      return pending.then(() => created)
    })

    const create = renderHook(() => useCreateExpenseMutation(), { wrapper })
    act(() => {
      create.result.current.mutate({ amountCents: 777, categoryId: category.id, spentAt: at(10), note: 'Optimistic' })
    })

    // before the service answers, the list already has it
    await waitFor(() => expect(list.result.current.data?.some((e) => e.note === 'Optimistic')).toBe(true))
    expect(list.result.current.data).toHaveLength(before + 1)

    release({} as Expense)
    await waitFor(() => expect(create.result.current.isSuccess).toBe(true))
    await waitFor(() => expect(list.result.current.data?.filter((e) => e.note === 'Optimistic')).toHaveLength(1))
    expect(list.result.current.data).toHaveLength(before + 1)
    expect(list.result.current.data?.every((e) => !e.id.startsWith('optimistic-'))).toBe(true)
  })

  it('create rolls back when the service fails', async () => {
    const { list } = await setup()
    const before = list.result.current.data?.length ?? 0
    const create = renderHook(() => useCreateExpenseMutation(), { wrapper })

    await act(async () => {
      create.result.current.mutate({ amountCents: 500, categoryId: 'missing', spentAt: at(10), note: 'Bad' })
    })
    await waitFor(() => expect(create.result.current.isError).toBe(true))
    await waitFor(() => expect(list.result.current.data).toHaveLength(before))
    expect(list.result.current.data?.some((e) => e.note === 'Bad')).toBe(false)
  })

  it('update edits in place; moving it out of the range removes it from the list', async () => {
    const { list } = await setup()
    const target = list.result.current.data![0]
    const update = renderHook(() => useUpdateExpenseMutation(), { wrapper })
    const input = { amountCents: 4242, categoryId: target.categoryId, spentAt: target.spentAt, note: 'Edited' }

    await act(async () => update.result.current.mutate({ id: target.id, input }))
    await waitFor(() => expect(list.result.current.data?.find((e) => e.id === target.id)?.note).toBe('Edited'))

    const lastYear = new Date(NOW.getFullYear() - 1, 5, 1)
    await act(async () => update.result.current.mutate({ id: target.id, input: { ...input, spentAt: lastYear } }))
    await waitFor(() => expect(list.result.current.data?.some((e) => e.id === target.id)).toBe(false))
  })

  it('delete removes it and does not bring it back after refetch', async () => {
    const { list } = await setup()
    const target = list.result.current.data![0]
    const del = renderHook(() => useDeleteExpenseMutation(), { wrapper })

    await act(async () => del.result.current.mutate(target.id))
    await waitFor(() => expect(del.result.current.isSuccess).toBe(true))
    await waitFor(() => expect(list.result.current.data?.some((e) => e.id === target.id)).toBe(false))
    expect(await API.expenses.expense_get(DEMO_UID, target.id)).toBeNull()
  })

  it('delete rolls back when the service fails', async () => {
    const { list } = await setup()
    const before = list.result.current.data!.length
    vi.spyOn(API.expenses, 'expense_delete').mockRejectedValue(new Error('network down'))
    const del = renderHook(() => useDeleteExpenseMutation(), { wrapper })

    await act(async () => del.result.current.mutate(list.result.current.data![0].id))
    await waitFor(() => expect(del.result.current.isError).toBe(true))
    await waitFor(() => expect(list.result.current.data).toHaveLength(before))
  })
})

describe('category + auth mutations', () => {
  it('deleting a category with expenses moves them first', async () => {
    const [food, groceries] = await API.categories.category_list(DEMO_UID)
    const del = renderHook(() => useDeleteCategoryMutation(), { wrapper })

    await act(async () => del.result.current.mutate({ id: food.id }))
    await waitFor(() => expect(del.result.current.isError).toBe(true)) // refused: still has expenses

    await act(async () => del.result.current.mutate({ id: food.id, moveExpensesTo: groceries.id }))
    await waitFor(() => expect(del.result.current.isSuccess).toBe(true))
    expect((await API.categories.category_list(DEMO_UID)).some((c) => c.id === food.id)).toBe(false)
  })

  it('sign out ends the session and clears the whole query cache', async () => {
    const seen: (string | null)[] = []
    const stop = API.auth.auth_onChange((u) => seen.push(u?.uid ?? null))
    renderHook(() => useGetCategoriesQuery(), { wrapper })
    await waitFor(() => expect(queryClient.getQueryData(QUERY_KEYS.categories)).toBeDefined())

    const signOut = renderHook(() => useSignOutMutation(), { wrapper })
    await act(async () => signOut.result.current.mutate())
    await waitFor(() => expect(signOut.result.current.isSuccess).toBe(true))
    stop()

    expect(queryClient.getQueryCache().getAll()).toHaveLength(0)
    expect(seen.at(-1)).toBeNull()
  })
})
