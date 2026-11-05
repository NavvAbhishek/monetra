import { endOfMonth, format, isValid, parse } from 'date-fns'
import { z } from 'zod'
import { MAX_NOTE_LENGTH } from '@/constant/defaultCategories'
import type { PastPeriodType, PastRecord, PastRecordInput } from '@/types/pastRecord'
import { fromCents, getCurrencyDigits, toCents } from '@/utils/money'

/**
 * Form values for a past-spending record. Strings, like the inputs hold them; converted with
 * `pastRecordFormToInput`. The period is either a month (month + year), a year, or a custom range.
 */
const ISO = 'yyyy-MM-dd'
const isIsoDay = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && isValid(parse(v, ISO, new Date()))

export const pastRecordSchema = z
  .object({
    amount: z.string().refine((v) => (toCents(v) ?? 0) > 0, 'Enter an amount greater than 0'),
    periodType: z.enum(['month', 'year', 'range']),
    /** '01'–'12' */
    month: z.string(),
    /** 'yyyy' */
    year: z.string(),
    /** 'yyyy-MM-dd' (custom range) */
    rangeStart: z.string(),
    rangeEnd: z.string(),
    /** a category id, or 'all' = not split by category */
    categoryId: z.string().min(1),
    note: z.string().max(MAX_NOTE_LENGTH, `Use ${MAX_NOTE_LENGTH} characters or fewer`),
  })
  .superRefine((v, ctx) => {
    if (v.periodType !== 'range' && !/^\d{4}$/.test(v.year)) {
      ctx.addIssue({ code: 'custom', path: ['year'], message: 'Choose a year' })
    }
    if (v.periodType === 'month' && !/^(0[1-9]|1[0-2])$/.test(v.month)) {
      ctx.addIssue({ code: 'custom', path: ['month'], message: 'Choose a month' })
    }
    if (v.periodType === 'range') {
      if (!isIsoDay(v.rangeStart)) ctx.addIssue({ code: 'custom', path: ['rangeStart'], message: 'Choose a start date' })
      if (!isIsoDay(v.rangeEnd)) ctx.addIssue({ code: 'custom', path: ['rangeEnd'], message: 'Choose an end date' })
      if (isIsoDay(v.rangeStart) && isIsoDay(v.rangeEnd) && v.rangeStart > v.rangeEnd) {
        ctx.addIssue({ code: 'custom', path: ['rangeEnd'], message: 'The end date must be after the start date' })
      }
    }
    const period = getFormPeriod(v)
    if (period && period.start > format(new Date(), ISO)) {
      ctx.addIssue({ code: 'custom', path: [v.periodType === 'range' ? 'rangeStart' : 'year'], message: 'Past spending can’t start in the future' })
    }
  })

export type PastRecordFormValues = z.infer<typeof pastRecordSchema>

/** The inclusive first / last day the form describes, or null while it is incomplete. */
export const getFormPeriod = (
  v: Pick<PastRecordFormValues, 'periodType' | 'month' | 'year' | 'rangeStart' | 'rangeEnd'>,
): { start: string; end: string } | null => {
  if (v.periodType === 'range') return isIsoDay(v.rangeStart) && isIsoDay(v.rangeEnd) ? { start: v.rangeStart, end: v.rangeEnd } : null
  if (!/^\d{4}$/.test(v.year)) return null
  if (v.periodType === 'year') return { start: `${v.year}-01-01`, end: `${v.year}-12-31` }
  if (!/^(0[1-9]|1[0-2])$/.test(v.month)) return null
  const first = parse(`${v.year}-${v.month}-01`, ISO, new Date())
  return { start: format(first, ISO), end: format(endOfMonth(first), ISO) }
}

export const pastRecordFormToInput = (v: PastRecordFormValues, currency: string): PastRecordInput => {
  const period = getFormPeriod(v) as { start: string; end: string } // valid after schema
  return {
    amountCents: toCents(v.amount, currency) ?? 0,
    categoryId: v.categoryId === 'all' ? null : v.categoryId,
    periodType: v.periodType as PastPeriodType,
    start: period.start,
    end: period.end,
    note: v.note.trim(),
  }
}

/** Defaults: last month, all categories. */
export const emptyPastRecordValues = (now: Date): PastRecordFormValues => {
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return {
    amount: '',
    periodType: 'month',
    month: format(lastMonth, 'MM'),
    year: format(lastMonth, 'yyyy'),
    rangeStart: format(new Date(now.getFullYear(), 0, 1), ISO),
    rangeEnd: format(now, ISO),
    categoryId: 'all',
    note: '',
  }
}

export const pastRecordToFormValues = (r: PastRecord, currency: string, now: Date): PastRecordFormValues => ({
  ...emptyPastRecordValues(now),
  amount: fromCents(r.amountCents, currency).toFixed(getCurrencyDigits(currency)),
  periodType: r.periodType,
  month: r.start.slice(5, 7),
  year: r.start.slice(0, 4),
  rangeStart: r.start,
  rangeEnd: r.end,
  categoryId: r.categoryId ?? 'all',
  note: r.note,
})
