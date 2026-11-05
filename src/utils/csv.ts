import { format } from 'date-fns'
import type { Category } from '@/types/category'
import type { Expense } from '@/types/expense'
import { fromCents, getCurrencyDigits } from './money'

export const CSV_HEADER = ['Date', 'Time', 'Category', 'Note', 'Amount', 'Currency'] as const

/**
 * Quotes a cell when needed. Text starting with = + - @ is prefixed with ' so spreadsheets
 * don't run it as a formula (CSV injection).
 */
export const escapeCsvCell = (value: string): string => {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

/** Expenses → CSV text (oldest first, CRLF line ends). Amount is a plain number, e.g. 24.50. */
export const expensesToCsv = (
  expenses: readonly Expense[],
  categories: readonly Category[],
  currency: string,
): string => {
  const names = new Map(categories.map((c) => [c.id, c.name]))
  const digits = getCurrencyDigits(currency)
  const rows = [...expenses]
    .sort((a, b) => a.spentAt.getTime() - b.spentAt.getTime())
    .map((e) =>
      [
        format(e.spentAt, 'yyyy-MM-dd'),
        format(e.spentAt, 'HH:mm'),
        escapeCsvCell(names.get(e.categoryId) ?? 'Uncategorised'),
        escapeCsvCell(e.note),
        fromCents(e.amountCents, currency).toFixed(digits),
        currency,
      ].join(','),
    )
  return [CSV_HEADER.join(','), ...rows].join('\r\n')
}

/** Browser download. The BOM makes Excel read the file as UTF-8 (emoji, accents). */
export const downloadCsv = (filename: string, csv: string): void => {
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
