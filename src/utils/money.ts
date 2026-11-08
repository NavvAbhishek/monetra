/**
 * Money helpers. The app stores money as INTEGER CENTS (minor units) — never floats.
 * CLAUDE.md §7.2.
 */

export const DEFAULT_CURRENCY = 'USD'

/** Number of minor-unit digits for a currency (USD 2, JPY 0, KWD 3). */
export const getCurrencyDigits = (currency: string = DEFAULT_CURRENCY): number => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).resolvedOptions()
      .maximumFractionDigits ?? 2
  } catch {
    return 2
  }
}

/**
 * Parses user input ("24.5", "1,234.56", "$12") to integer cents.
 * Returns null for empty / invalid / negative input.
 */
export const toCents = (input: string | number, currency: string = DEFAULT_CURRENCY): number | null => {
  const digits = getCurrencyDigits(currency)
  if (typeof input === 'string' && input.includes('+')) return null // sums go through sumAmountExpression, never a silent "500100"
  const raw = typeof input === 'number' ? String(input) : input.replace(/[^\d.-]/g, '')
  if (raw === '' || raw === '-' || raw === '.') return null
  if (!/^-?\d*\.?\d*$/.test(raw)) return null
  const value = Number(raw)
  if (!Number.isFinite(value) || value < 0) return null
  return Math.round(value * 10 ** digits)
}

/** Integer cents → major units number (2450 → 24.5). */
export const fromCents = (cents: number, currency: string = DEFAULT_CURRENCY): number =>
  cents / 10 ** getCurrencyDigits(currency)

const formatterCache = new Map<string, Intl.NumberFormat>()

const getFormatter = (currency: string, compact: boolean): Intl.NumberFormat => {
  const key = `${currency}|${compact}`
  let formatter = formatterCache.get(key)
  if (!formatter) {
    try {
      formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        ...(compact ? { notation: 'compact', maximumFractionDigits: 1 } : {}),
      })
    } catch {
      formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: DEFAULT_CURRENCY })
    }
    formatterCache.set(key, formatter)
  }
  return formatter
}

export type FormatMoneyOptions = {
  /** "$1.2K" style for tight spaces (chart labels). */
  compact?: boolean
}

/** Integer cents → display string: formatMoney(2450, 'USD') → "$24.50". */
export const formatMoney = (
  cents: number,
  currency: string = DEFAULT_CURRENCY,
  { compact = false }: FormatMoneyOptions = {},
): string => getFormatter(currency, compact).format(fromCents(cents, currency))

/** Cents → short plain number for chart axes, no currency sign: 940000 → "9.4K", 1250000000 → "12.5M". */
export const formatCompactNumber = (cents: number, currency: string = DEFAULT_CURRENCY): string =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(fromCents(cents, currency))

/** "$", "€", "Rs"… for a currency code (shown beside the amount input). */
export const getCurrencySymbol = (currency: string = DEFAULT_CURRENCY): string => {
  try {
    const parts = new Intl.NumberFormat('en-US', { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }).formatToParts(0)
    return parts.find((p) => p.type === 'currency')?.value ?? currency
  } catch {
    return currency
  }
}
