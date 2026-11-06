import { toCents } from './money'

/**
 * Amounts as a sum — "500+100+600". The Add-expense form keeps its amount chips in one string like this,
 * so several amounts for one expense are saved once, as their total.
 */

/** Total in cents of "500+100+600". Blank parts (e.g. a trailing "+") are ignored. null if empty or any part is invalid / ≤ 0. */
export const sumAmountExpression = (text: string, currency?: string): number | null => {
  const parts = text
    .split('+')
    .map((part) => part.trim())
    .filter((part) => part !== '')
  if (parts.length === 0) return null
  let total = 0
  for (const part of parts) {
    const cents = toCents(part, currency)
    if (cents === null || cents <= 0) return null
    total += cents
  }
  return total
}

/** The numbers in an expression, as typed. "500+100+" → ["500", "100"]. */
export const splitAmountParts = (text: string): string[] =>
  text
    .split('+')
    .map((part) => part.trim())
    .filter((part) => part !== '')
