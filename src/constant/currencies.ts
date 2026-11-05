export type CurrencyOption = { value: string; symbol: string; label: string }

const make = (value: string, symbol: string): CurrencyOption => ({
  value,
  symbol,
  label: `${value} · ${symbol}`,
})

/** Sign-up / settings currency list. Labels match the design ("USD · $"). */
export const CURRENCIES: readonly CurrencyOption[] = [
  make('USD', '$'),
  make('EUR', '€'),
  make('GBP', '£'),
  make('LKR', 'Rs'),
  make('INR', '₹'),
  make('AUD', 'A$'),
  make('CAD', 'C$'),
  make('SGD', 'S$'),
  make('AED', 'د.إ'),
  make('JPY', '¥'),
]

export const CURRENCY_CODES: readonly string[] = CURRENCIES.map((c) => c.value)
