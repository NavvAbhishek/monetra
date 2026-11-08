import { addDays, endOfMonth, format, isValid, parse, startOfDay } from 'date-fns'
import type { Category } from '@/types/category'
import type { PastPeriodType, PastRecord, PastRecordInput } from '@/types/pastRecord'
import { escapeCsvCell } from './csv'
import { parseCsv } from './csvParse'
import { getCurrencyDigits, toCents } from './money'
import { formatPastPeriod } from './pastSpending'

/**
 * CSV import of past spending (user request 2026-11-08). The user picks how their file is organised —
 * one row per day, week, month or year — downloads a sample, fills it in and uploads it.
 *
 * The file is a grid like a spreadsheet: the first column is the period, then ONE COLUMN PER CATEGORY holding the
 * amount spent in that category in that period (blank or 0 = nothing). Every non-zero cell becomes one past record.
 * Everything here is pure: text in → a preview (valid rows + problems) out; nothing is saved until the user confirms.
 */

export type ImportGranularity = 'day' | 'week' | 'month' | 'year'

type GranularityInfo = {
  value: ImportGranularity
  label: string
  /** One line for the picker. */
  description: string
  /** Name of the first CSV column. */
  column: string
  /** How a value in that column looks. */
  format: string
  /** How the records are stored. */
  periodType: PastPeriodType
}

export const IMPORT_GRANULARITIES: readonly GranularityInfo[] = [
  { value: 'day', label: 'Daily', description: 'One row per day', column: 'date', format: 'YYYY-MM-DD, e.g. 2025-03-14', periodType: 'range' },
  { value: 'week', label: 'Weekly', description: 'One row per week (7 days from the date you give)', column: 'week_start', format: 'YYYY-MM-DD of the first day, e.g. 2025-03-10', periodType: 'range' },
  { value: 'month', label: 'Monthly', description: 'One row per month', column: 'month', format: 'YYYY-MM, e.g. 2025-03', periodType: 'month' },
  { value: 'year', label: 'Yearly', description: 'One row per year', column: 'year', format: 'YYYY, e.g. 2024', periodType: 'year' },
]

export const getGranularity = (value: ImportGranularity): GranularityInfo =>
  IMPORT_GRANULARITIES.find((g) => g.value === value) as GranularityInfo

/** Most rows one file may hold, and most records they may create (written in batches of ~450). */
export const MAX_IMPORT_ROWS = 1000
export const MAX_IMPORT_RECORDS = 3000

/** A header that means "not split by category". */
const ALL_CATEGORIES = 'all categories'

const ISO = 'yyyy-MM-dd'
const MAX_CENTS = 100_000_000_000 // the security rules' limit

// ---------------------------- sample file --------------------------

/** A sample CSV: the period column + one column per category, with two example rows to replace. */
export const buildSampleCsv = (granularity: ImportGranularity, categories: readonly Category[], currency: string, now: Date): string => {
  const info = getGranularity(granularity)
  const digits = getCurrencyDigits(currency)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const monthBefore = new Date(now.getFullYear(), now.getMonth() - 2, 1)

  const periods: Record<ImportGranularity, [string, string]> = {
    day: [format(addDays(lastMonth, 4), ISO), format(addDays(lastMonth, 5), ISO)],
    week: [format(lastMonth, ISO), format(addDays(lastMonth, 7), ISO)],
    month: [format(monthBefore, 'yyyy-MM'), format(lastMonth, 'yyyy-MM')],
    year: [String(now.getFullYear() - 2), String(now.getFullYear() - 1)],
  }
  const base: Record<ImportGranularity, number> = { day: 250, week: 1500, month: 6000, year: 72000 }
  const columns = categories.length > 0 ? categories.map((c) => c.name) : ['All categories']
  // example amounts: the first few categories get a number, the rest 0 (like a spreadsheet with empty days)
  const example = (row: number) => columns.map((_, i) => (i < 3 && (i + row) % 3 !== 2 ? ((base[granularity] * (4 - i)) / (row + 3)).toFixed(digits) : '0'))

  const rows = [[info.column, ...columns], [periods[granularity][0], ...example(0)], [periods[granularity][1], ...example(1)]]
  return rows.map((r) => r.map(escapeCsvCell).join(',')).join('\r\n')
}

export const sampleFilename = (granularity: ImportGranularity): string => `monetra-past-spending-${getGranularity(granularity).label.toLowerCase()}.csv`

// ---------------------------- reading a file --------------------------

export type ImportRow = {
  /** 1-based line in the file (the header is line 1). */
  line: number
  input: PastRecordInput
  /** "March 2025" etc. for the preview. */
  periodLabel: string
  /** Category name, or "All categories". */
  categoryLabel: string
  /** Same record already exists (e.g. from an earlier import) — skipped on import. */
  duplicate: boolean
}

export type ImportProblem = { line: number; message: string }

export type ImportPreview = {
  rows: ImportRow[]
  problems: ImportProblem[]
  /** The file as a whole can't be used (wrong columns, empty, too long). */
  fileError: string | null
  /** Rows in the file (not records). */
  fileRows: number
}

const norm = (s: string) => s.trim().toLowerCase().replace(/[\s-]+/g, '_')

const parseDay = (value: string): Date | null => {
  const v = value.trim().replace(/\//g, '-')
  if (!/^\d{4}-\d{1,2}-\d{1,2}$/.test(v)) return null
  const d = parse(v, 'yyyy-M-d', new Date())
  return isValid(d) ? startOfDay(d) : null
}

const MONTH_FORMATS = ['yyyy-M', 'yyyy-MM', 'MMM-yy', 'MMM-yyyy', 'MMM yyyy', 'MMMM yyyy', 'MMMM-yyyy'] as const
/** "2025-03", and what Excel turns it into ("Mar-25", "March 2025"). */
const parseMonth = (value: string): Date | null => {
  const v = value.trim().replace(/\//g, '-')
  for (const f of MONTH_FORMATS) {
    const d = parse(v, f, new Date())
    if (isValid(d)) return new Date(d.getFullYear(), d.getMonth(), 1)
  }
  return null
}

/** "1,250.50" / "LKR 1250.5" → cents. `null` = not a number; 0 = nothing spent (skipped by the caller). */
const parseAmount = (value: string, currency: string): number | null => {
  const cleaned = value.replace(/[\s,]/g, '').replace(/^[^\d.]+/, '')
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return null
  const cents = toCents(cleaned, currency)
  return cents !== null && cents < MAX_CENTS ? cents : null
}

const recordKey = (r: Pick<PastRecordInput, 'periodType' | 'start' | 'end' | 'categoryId' | 'amountCents'>) =>
  `${r.periodType}|${r.start}|${r.end}|${r.categoryId ?? ''}|${r.amountCents}`

type CategoryColumn = { index: number; name: string; category: Category | null }

export const parseImportCsv = (
  text: string,
  granularity: ImportGranularity,
  categories: readonly Category[],
  currency: string,
  existing: readonly PastRecord[],
  now: Date,
): ImportPreview => {
  const info = getGranularity(granularity)
  const fail = (fileError: string, fileRows = 0): ImportPreview => ({ rows: [], problems: [], fileError, fileRows })
  const table = parseCsv(text)
  if (table.length === 0) return fail('The file is empty.')

  const header = table[0]
  const periodCol = header.map(norm).indexOf(info.column)
  if (periodCol < 0) {
    const other = IMPORT_GRANULARITIES.find((g) => g.value !== granularity && header.map(norm).includes(g.column))
    return fail(
      other
        ? `This looks like a ${other.label.toLowerCase()} file, but you chose ${info.label.toLowerCase()}. Go back and pick ${other.label.toLowerCase()}, or download the ${info.label.toLowerCase()} sample.`
        : `The first column must be called “${info.column}”. Download the sample and keep its first row.`,
    )
  }

  // every other column is a category (matched by name), or "All categories" for a total that isn't split
  const byName = new Map(categories.map((c) => [c.name.trim().toLowerCase(), c]))
  const problems: ImportProblem[] = []
  const columns: CategoryColumn[] = []
  header.forEach((raw, index) => {
    const name = raw.trim()
    if (index === periodCol || name === '') return
    const key = name.toLowerCase()
    if (key === ALL_CATEGORIES) return columns.push({ index, name, category: null })
    const category = byName.get(key)
    if (category) return columns.push({ index, name: category.name, category })
    problems.push({ line: 1, message: `Column “${name}” isn’t one of your categories, so it was left out. Create the category first, or rename the column.` })
  })
  if (columns.length === 0) return fail('No category columns found. After the first column, add one column per category, named exactly like your categories.')

  const body = table.slice(1)
  if (body.length === 0) return fail('The file has no rows under the header.')
  if (body.length > MAX_IMPORT_ROWS) return fail(`The file has ${body.length} rows. Import up to ${MAX_IMPORT_ROWS} at a time — split it into smaller files.`, body.length)

  const existingKeys = new Set(existing.map(recordKey))
  const today = startOfDay(now)
  const rows: ImportRow[] = []

  body.forEach((cells, i) => {
    const line = i + 2
    const raw = (cells[periodCol] ?? '').trim()

    let start: Date | null = null
    let end: Date | null = null
    if (granularity === 'day' || granularity === 'week') {
      start = parseDay(raw)
      if (start) end = granularity === 'day' ? start : addDays(start, 6)
    } else if (granularity === 'month') {
      start = parseMonth(raw)
      if (start) end = endOfMonth(start)
    } else if (/^\d{4}$/.test(raw) && Number(raw) >= 1900) {
      start = new Date(Number(raw), 0, 1)
      end = new Date(Number(raw), 11, 31)
    }
    if (!start || !end) {
      problems.push({ line, message: `“${raw || 'empty'}” isn’t a valid ${info.column.replace('_', ' ')}. Use ${info.format}.` })
      return
    }
    if (start > today) {
      problems.push({ line, message: `${raw} is in the future — past spending must already have happened.` })
      return
    }

    for (const column of columns) {
      const cell = (cells[column.index] ?? '').trim()
      if (cell === '') continue
      const amountCents = parseAmount(cell, currency)
      if (amountCents === null) {
        problems.push({ line, message: `“${cell}” in ${column.name} isn’t a valid amount. Use a plain number, e.g. 1250.50.` })
        continue
      }
      if (amountCents === 0) continue // 0 = nothing spent
      const input: PastRecordInput = {
        amountCents,
        categoryId: column.category?.id ?? null,
        periodType: info.periodType,
        start: format(start, ISO),
        end: format(end, ISO),
        note: '',
      }
      rows.push({
        line,
        input,
        periodLabel: formatPastPeriod(input),
        categoryLabel: column.category ? `${column.category.emoji} ${column.category.name}` : 'All categories',
        duplicate: existingKeys.has(recordKey(input)),
      })
    }
  })

  if (rows.length > MAX_IMPORT_RECORDS) return fail(`This file would create ${rows.length} records. Import up to ${MAX_IMPORT_RECORDS} at a time — split it into smaller files.`, body.length)
  if (rows.length === 0 && problems.length === 0) return fail('Every amount in the file is 0 or blank, so there is nothing to import.', body.length)
  return { rows, problems, fileError: null, fileRows: body.length }
}
