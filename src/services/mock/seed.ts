import { addDays, startOfDay } from 'date-fns'
import { DEFAULT_CATEGORIES } from '@/constant/defaultCategories'
import type { Category } from '@/types/category'
import type { Expense } from '@/types/expense'
import { newId, type MockDb, type MockUser } from './db'

/** Sample data for the UI-first phase, based on the design (Sam, week of Nov 23–29). */

export const DEMO_UID = 'demo-sam'
export const DEMO_EMAIL = 'sam@email.com'
export const DEMO_NAME = 'Sam Perera'

export const buildDefaultCategories = (now: Date = new Date()): Category[] =>
  DEFAULT_CATEGORIES.map((c, i) => ({ id: newId(), ...c, order: i, createdAt: now }))

/** Deterministic pseudo-random numbers (mulberry32) so the sample data is stable. */
const createRandom = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

type SeedRow = { offset: number; hour: number; minute: number; note: string; category: string; cents: number }

/** The 9 expenses shown on the design screens, as days before today (0 = today). */
const DESIGN_ROWS: SeedRow[] = [
  { offset: 0, hour: 13, minute: 10, note: 'Lunch with Ana', category: 'Food', cents: 2450 },
  { offset: 0, hour: 8, minute: 30, note: 'Bus pass top-up', category: 'Transport', cents: 1830 },
  { offset: 1, hour: 18, minute: 0, note: 'Weekly groceries', category: 'Groceries', cents: 4620 },
  { offset: 1, hour: 20, minute: 15, note: 'Cinema tickets', category: 'Fun', cents: 1480 },
  { offset: 2, hour: 9, minute: 0, note: 'Electricity bill', category: 'Bills', cents: 3810 },
  { offset: 2, hour: 12, minute: 40, note: 'Pharmacy', category: 'Health', cents: 1240 },
  { offset: 2, hour: 8, minute: 5, note: 'Morning coffee', category: 'Food', cents: 200 },
  { offset: 3, hour: 11, minute: 0, note: 'Farmers market', category: 'Groceries', cents: 2170 },
  { offset: 3, hour: 19, minute: 30, note: 'Dinner out', category: 'Food', cents: 1650 },
]

/** Older history: weighted category pick → [notes, min cents, max cents]. */
const HISTORY: { category: string; weight: number; notes: string[]; min: number; max: number }[] = [
  { category: 'Food', weight: 0.3, notes: ['Lunch', 'Coffee', 'Dinner out', 'Takeaway'], min: 200, max: 2800 },
  { category: 'Groceries', weight: 0.22, notes: ['Supermarket', 'Farmers market', 'Bakery'], min: 800, max: 6500 },
  { category: 'Bills', weight: 0.07, notes: ['Electricity bill', 'Internet', 'Phone plan'], min: 2500, max: 9000 },
  { category: 'Transport', weight: 0.18, notes: ['Bus pass', 'Taxi', 'Fuel'], min: 300, max: 4500 },
  { category: 'Fun', weight: 0.13, notes: ['Cinema', 'Concert', 'Games'], min: 800, max: 6000 },
  { category: 'Health', weight: 0.1, notes: ['Pharmacy', 'Gym', 'Dentist'], min: 500, max: 7000 },
]

const HISTORY_DAYS = 400

/** ~13 months of expenses ending today. Never in the future. */
export const buildSeedExpenses = (categories: readonly Category[], now: Date = new Date()): Expense[] => {
  const idByName = new Map(categories.map((c) => [c.name, c.id]))
  const today = startOfDay(now)
  const expenses: Expense[] = []
  let counter = 0

  const add = (offset: number, hour: number, minute: number, note: string, category: string, cents: number) => {
    const categoryId = idByName.get(category)
    if (!categoryId) return
    const at = addDays(today, -offset)
    at.setHours(hour, minute, 0, 0)
    const spentAt = at > now ? new Date(now) : at
    expenses.push({
      id: `seed-${++counter}`,
      amountCents: cents,
      categoryId,
      spentAt,
      note,
      createdAt: spentAt,
      updatedAt: spentAt,
    })
  }

  for (const r of DESIGN_ROWS) add(r.offset, r.hour, r.minute, r.note, r.category, r.cents)

  const random = createRandom(2026)
  for (let offset = 4; offset < HISTORY_DAYS; offset++) {
    const r = random()
    const count = r < 0.25 ? 0 : r < 0.65 ? 1 : r < 0.9 ? 2 : 3
    for (let i = 0; i < count; i++) {
      let pick = random()
      const template = HISTORY.find((h) => (pick -= h.weight) < 0) ?? HISTORY[0]
      const cents = Math.round((template.min + random() * (template.max - template.min)) / 10) * 10
      const note = template.notes[Math.floor(random() * template.notes.length)]
      add(offset, 8 + Math.floor(random() * 14), Math.floor(random() * 60), note, template.category, cents)
    }
  }
  return expenses
}

/** Adds a user with default categories, optionally with the sample expenses. */
export const addUser = (
  db: MockDb,
  user: Pick<MockUser, 'uid' | 'name' | 'email' | 'currency'> & { photoURL?: string | null },
  { withSampleData }: { withSampleData: boolean },
  now: Date = new Date(),
): MockUser => {
  const created: MockUser = { ...user, createdAt: now }
  const categories = buildDefaultCategories(now)
  db.users.push(created)
  db.categories[user.uid] = categories
  db.expenses[user.uid] = withSampleData ? buildSeedExpenses(categories, now) : []
  return created
}

/** The demo account (sam@email.com) is created the first time the mock db is used. */
export const ensureDemoUser = (db: MockDb): MockUser => {
  const existing = db.users.find((u) => u.uid === DEMO_UID)
  if (existing) return existing
  return addUser(
    db,
    { uid: DEMO_UID, name: DEMO_NAME, email: DEMO_EMAIL, currency: 'USD' },
    { withSampleData: true },
  )
}
