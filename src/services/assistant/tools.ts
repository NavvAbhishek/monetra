import { addDays, addMonths, addYears, differenceInCalendarDays, format, isValid, parse, startOfDay, startOfMonth, startOfWeek, startOfYear } from 'date-fns'
import type { Category } from '@/types/category'
import type { Expense } from '@/types/expense'
import type { PastRecord } from '@/types/pastRecord'
import type { DateRange } from '@/types/period'
import { groupByDay, sumCents, totalsByCategory } from '@/utils/aggregate'
import { fromCents, formatMoney } from '@/utils/money'
import { isPastItem, pastRecordsToExpenses, UNSPLIT_CATEGORY } from '@/utils/pastSpending'
import { highestMonth, monthlyAverageCents } from '@/utils/spending-stats'

/**
 * The spending assistant's tools (backend-agnostic). The AI model never does maths: it asks for numbers
 * through these functions, which compute them here from the user's data — tracked expenses PLUS past spending,
 * exactly like the dashboard (CLAUDE.md §7.5). Amounts are returned already formatted in the user's currency.
 */

/** What the tools need from a backend. */
export type AssistantData = {
  currency: string
  categories: Category[]
  listExpenses: (range: DateRange) => Promise<Expense[]>
  listPastRecords: () => Promise<PastRecord[]>
}

// ---------------------------- declarations (plain, converted to the SDK's schema by the Firebase service) --------------------------

export type ToolParam = { type: 'string' | 'integer'; description: string; enum?: string[]; optional?: boolean }
export type ToolSpec = { name: string; description: string; params: Record<string, ToolParam> }

const FROM: ToolParam = { type: 'string', description: 'First day, inclusive, YYYY-MM-DD.' }
const TO: ToolParam = { type: 'string', description: 'Last day, inclusive, YYYY-MM-DD. Use today for "so far".' }
const CATEGORY: ToolParam = { type: 'string', description: 'Exact category name to filter by. Omit for all categories.', optional: true }

export const ASSISTANT_TOOLS: ToolSpec[] = [
  {
    name: 'get_spending_summary',
    description:
      'Totals for a date range: total spent, split into tracked vs past spending, daily and monthly average, number of tracked expenses, spending per category with %, highest day and highest month.',
    params: { from: FROM, to: TO, category: CATEGORY },
  },
  {
    name: 'get_spending_over_time',
    description: 'Spending in a date range grouped by day, week (Monday first), month or year — for trends and comparing periods.',
    params: {
      from: FROM,
      to: TO,
      group_by: { type: 'string', description: 'Size of each group.', enum: ['day', 'week', 'month', 'year'] },
      category: CATEGORY,
    },
  },
  {
    name: 'find_expenses',
    description:
      'Individual tracked expenses (not past spending, which only exists as totals) in a date range, largest or newest first, optionally filtered by category or by words in the note.',
    params: {
      from: FROM,
      to: TO,
      category: CATEGORY,
      note_contains: { type: 'string', description: 'Only expenses whose note contains this text.', optional: true },
      sort: { type: 'string', description: 'Order of the list.', enum: ['largest', 'newest'], optional: true },
      limit: { type: 'integer', description: 'How many to return, 1–20. Default 10.', optional: true },
    },
  },
]

// ---------------------------- running a tool --------------------------

type Args = Record<string, unknown>

const ISO = 'yyyy-MM-dd'
const MAX_GROUPS = 120

class ToolInputError extends Error {}

const text = (args: Args, key: string): string | undefined => {
  const v = args[key]
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined
}

/** "from"/"to" → [start, end) with `to` capped at today. */
const readRange = (args: Args, now: Date): DateRange & { first: Date; last: Date } => {
  const parseDay = (key: string) => {
    const raw = text(args, key)
    const d = raw ? parse(raw, ISO, new Date()) : null
    if (!d || !isValid(d)) throw new ToolInputError(`"${key}" must be a date like ${format(now, ISO)}.`)
    return startOfDay(d)
  }
  const first = parseDay('from')
  const today = startOfDay(now)
  const requested = parseDay('to')
  const last = requested > today ? today : requested
  if (first > last) throw new ToolInputError('"from" must be on or before "to" (and not in the future).')
  return { start: first, end: addDays(last, 1), first, last }
}

/** Category name (case-insensitive, also "Not split by category") → category, or throws with the valid names. */
const readCategory = (args: Args, data: AssistantData): Category | null => {
  const name = text(args, 'category')
  if (!name || /^all( categories)?$/i.test(name)) return null
  const all = [...data.categories, UNSPLIT_CATEGORY]
  const found = all.find((c) => c.name.toLowerCase() === name.toLowerCase())
  if (!found) throw new ToolInputError(`No category called "${name}". Categories: ${all.map((c) => c.name).join(', ')}.`)
  return found
}

const money = (cents: number, data: AssistantData) => ({ amount: formatMoney(cents, data.currency), value: fromCents(cents, data.currency) })

/** Tracked expenses + past spending (spread over its days) in the range, optionally one category. */
const loadItems = async (range: DateRange, category: Category | null, data: AssistantData) => {
  const [expenses, records] = await Promise.all([data.listExpenses(range), data.listPastRecords()])
  const items = [...expenses, ...pastRecordsToExpenses(records, range).items]
  return category ? items.filter((i) => i.categoryId === category.id) : items
}

const summary = async (args: Args, data: AssistantData, now: Date) => {
  const range = readRange(args, now)
  const category = readCategory(args, data)
  const items = await loadItems(range, category, data)
  const days = differenceInCalendarDays(range.last, range.first) + 1
  const total = sumCents(items)
  const pastTotal = sumCents(items.filter(isPastItem))
  const names = new Map([...data.categories, UNSPLIT_CATEGORY].map((c) => [c.id, c.name]))
  const topDay = groupByDay(items).reduce<{ date: Date; totalCents: number } | null>((best, g) => (!best || g.totalCents > best.totalCents ? g : best), null)
  const topMonth = highestMonth(items)

  return {
    from: format(range.first, ISO),
    to: format(range.last, ISO),
    days,
    category: category?.name ?? 'all categories',
    total: money(total, data),
    tracked: money(total - pastTotal, data),
    pastSpending: money(pastTotal, data),
    dailyAverage: money(days > 0 ? Math.round(total / days) : 0, data),
    monthlyAverage: money(monthlyAverageCents(total, days), data),
    trackedExpenseCount: items.filter((i) => !isPastItem(i)).length,
    byCategory: category
      ? undefined
      : totalsByCategory(items).map((t) => ({ category: names.get(t.categoryId) ?? 'Unknown', ...money(t.cents, data), percent: t.percent })),
    highestDay: topDay ? { date: format(topDay.date, ISO), ...money(topDay.totalCents, data) } : null,
    highestMonth: topMonth ? { month: format(topMonth.monthStart, 'MMMM yyyy'), ...money(topMonth.cents, data) } : null,
    note: pastTotal > 0 ? 'Past spending (added before using Monetra) is included; longer past records are spread evenly over their days.' : undefined,
  }
}

const overTime = async (args: Args, data: AssistantData, now: Date) => {
  const range = readRange(args, now)
  const category = readCategory(args, data)
  const groupBy = text(args, 'group_by') ?? 'month'
  const step = { day: (d: Date) => addDays(d, 1), week: (d: Date) => addDays(d, 7), month: (d: Date) => addMonths(d, 1), year: (d: Date) => addYears(d, 1) }[groupBy]
  const align = { day: (d: Date) => d, week: (d: Date) => startOfWeek(d, { weekStartsOn: 1 }), month: startOfMonth, year: startOfYear }[groupBy]
  const label = { day: (d: Date) => format(d, ISO), week: (d: Date) => `week of ${format(d, ISO)}`, month: (d: Date) => format(d, 'MMMM yyyy'), year: (d: Date) => format(d, 'yyyy') }[groupBy]
  if (!step || !align || !label) throw new ToolInputError('"group_by" must be day, week, month or year.')

  const groups: { start: Date; end: Date; cents: number }[] = []
  for (let s = align(range.start); s < range.end; s = step(s)) {
    groups.push({ start: s, end: step(s), cents: 0 })
    if (groups.length > MAX_GROUPS) throw new ToolInputError(`Too many ${groupBy}s in that range — use a bigger group_by.`)
  }
  for (const item of await loadItems(range, category, data)) {
    const g = groups.find((x) => item.spentAt >= x.start && item.spentAt < x.end)
    if (g) g.cents += item.amountCents
  }
  return {
    category: category?.name ?? 'all categories',
    groupBy,
    groups: groups.map((g) => ({ period: label(g.start), ...money(g.cents, data) })),
  }
}

const find = async (args: Args, data: AssistantData, now: Date) => {
  const range = readRange(args, now)
  const category = readCategory(args, data)
  const words = text(args, 'note_contains')?.toLowerCase()
  const sort = text(args, 'sort') === 'newest' ? 'newest' : 'largest'
  const rawLimit = typeof args.limit === 'number' ? args.limit : Number(args.limit)
  const limit = Number.isFinite(rawLimit) ? Math.min(20, Math.max(1, Math.round(rawLimit))) : 10
  const names = new Map(data.categories.map((c) => [c.id, c.name]))

  const matches = (await data.listExpenses(range))
    .filter((e) => (!category || e.categoryId === category.id) && (!words || e.note.toLowerCase().includes(words)))
    .sort((a, b) => (sort === 'largest' ? b.amountCents - a.amountCents : b.spentAt.getTime() - a.spentAt.getTime()))

  return {
    matchCount: matches.length,
    matchTotal: money(sumCents(matches), data),
    expenses: matches.slice(0, limit).map((e) => ({
      date: format(e.spentAt, ISO),
      category: names.get(e.categoryId) ?? 'Unknown',
      note: e.note || undefined,
      ...money(e.amountCents, data),
    })),
  }
}

const RUNNERS: Record<string, (args: Args, data: AssistantData, now: Date) => Promise<object>> = {
  get_spending_summary: summary,
  get_spending_over_time: overTime,
  find_expenses: find,
}

/** Runs one tool call from the model. Bad input comes back as `{ error }` so the model can fix its call. */
export const runAssistantTool = async (name: string, args: Args, data: AssistantData, now = new Date()): Promise<object> => {
  const run = RUNNERS[name]
  if (!run) return { error: `Unknown tool "${name}".` }
  try {
    return await run(args ?? {}, data, now)
  } catch (error) {
    if (error instanceof ToolInputError) return { error: error.message }
    throw error
  }
}

/**
 * This month's and last month's summaries, computed before the question is sent: the most common questions
 * ("this month", "last month", "compare them") are then answered in ONE call to the model, with no tool round trip.
 */
export const buildQuickFacts = async (data: AssistantData, now = new Date()): Promise<string> => {
  const iso = (d: Date) => format(d, ISO)
  const monthStart = startOfMonth(now)
  const lastMonthStart = addMonths(monthStart, -1)
  const [thisMonth, lastMonth] = await Promise.all([
    summary({ from: iso(monthStart), to: iso(now) }, data, now),
    summary({ from: iso(lastMonthStart), to: iso(addDays(monthStart, -1)) }, data, now),
  ])
  return JSON.stringify({ thisMonthSoFar: thisMonth, lastMonth })
}

/** Instructions for the model: who it is, today's date, the currency and category names, quick facts, and how to answer. */
export const buildSystemInstruction = (data: AssistantData, quickFacts: string, now = new Date()): string =>
  [
    'You are the assistant inside Monetra, a personal expense tracker. You answer questions about the user\'s own spending.',
    `Today is ${format(now, 'EEEE, yyyy-MM-dd')}. Weeks start on Monday. Currency: ${data.currency}.`,
    `The user's categories: ${[...data.categories.map((c) => c.name), UNSPLIT_CATEGORY.name].join(', ')}.`,
    `Quick facts (already computed with the tools — use them directly, no tool call needed): ${quickFacts}`,
    'Rules:',
    '- For anything not in the quick facts, ALWAYS get numbers from the tools. Never guess, estimate or do your own arithmetic when a tool can give the figure; to compare periods, call the tools for each period and report the tool amounts.',
    '- Turn relative dates ("this month", "last year", "since March") into exact YYYY-MM-DD dates using today\'s date. "All time" means from 2000-01-01 to today.',
    '- Map the user\'s words to the closest category name above (e.g. "eating out" → a food category). If unsure, ask.',
    '- Use the formatted "amount" strings from the tools exactly as given.',
    '- Totals include past spending the user imported from before Monetra (spread evenly over each record\'s days); mention this when it matters.',
    '- Reply briefly in plain text. You may use short "- " bullet lists and **bold**. No tables, no headings, no code.',
    '- Only help with the user\'s money and spending. Politely decline other topics. You may give general budgeting tips, but no investment, tax or legal advice.',
  ].join('\n')
