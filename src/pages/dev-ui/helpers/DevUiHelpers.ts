export const COLOUR_TOKENS = [
  { name: 'primary', className: 'bg-primary' },
  { name: 'primary-hover', className: 'bg-primary-hover' },
  { name: 'primary-soft', className: 'bg-primary-soft' },
  { name: 'ink', className: 'bg-ink' },
  { name: 'muted-foreground', className: 'bg-muted-foreground' },
  { name: 'muted-2', className: 'bg-muted-2' },
  { name: 'bg', className: 'bg-bg' },
  { name: 'muted', className: 'bg-muted' },
  { name: 'track', className: 'bg-track' },
  { name: 'line', className: 'bg-line' },
  { name: 'bar', className: 'bg-bar' },
  { name: 'success', className: 'bg-success' },
  { name: 'danger', className: 'bg-danger' },
  { name: 'danger-soft', className: 'bg-danger-soft' },
] as const

export const TYPE_TOKENS = [
  { name: 'text-hero · 42', className: 'text-hero font-extrabold' },
  { name: 'text-5xl · 32', className: 'text-5xl font-extrabold' },
  { name: 'text-4xl · 28', className: 'text-4xl font-extrabold' },
  { name: 'text-3xl · 24', className: 'text-3xl font-extrabold' },
  { name: 'text-2xl · 20', className: 'text-2xl font-bold' },
  { name: 'text-xl · 17', className: 'text-xl font-bold' },
  { name: 'text-lg · 16', className: 'text-lg font-semibold' },
  { name: 'text-md · 15', className: 'text-md' },
  { name: 'text-base · 14', className: 'text-base' },
  { name: 'text-sm · 13', className: 'text-sm' },
  { name: 'text-xs · 12', className: 'text-xs' },
  { name: 'text-2xs · 11', className: 'text-2xs' },
] as const

export const RADIUS_TOKENS = [
  { name: 'check · 6', className: 'rounded-check' },
  { name: 'chip · 10', className: 'rounded-chip' },
  { name: 'control · 12', className: 'rounded-control' },
  { name: 'icon · 14', className: 'rounded-icon' },
  { name: 'panel · 16', className: 'rounded-panel' },
  { name: 'fab · 18', className: 'rounded-fab' },
  { name: 'tile · 20', className: 'rounded-tile' },
  { name: 'table · 24', className: 'rounded-table' },
  { name: 'card · 28', className: 'rounded-card' },
  { name: 'dialog · 30', className: 'rounded-dialog' },
] as const

export const BUTTON_VARIANTS = [
  'primary',
  'secondary',
  'surface',
  'outline',
  'ghost',
  'danger',
  'danger-soft',
  'danger-ghost',
  'link',
] as const

export const BUTTON_SIZES = ['sm', 'md', 'lg', 'xl'] as const

export const ICON_BUTTON_VARIANTS = ['surface', 'muted', 'ghost', 'primary', 'danger-soft'] as const

export const PERIOD_OPTIONS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
  { value: 'range', label: 'Range' },
] as const

export type PeriodOption = (typeof PERIOD_OPTIONS)[number]['value']

export const EMOJI_GROUP_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'food', label: 'Food' },
  { value: 'travel', label: 'Travel' },
  { value: 'home', label: 'Home' },
] as const

export type EmojiGroupOption = (typeof EMOJI_GROUP_OPTIONS)[number]['value']

export const SAMPLE_CATEGORIES = [
  { emoji: '🍔', name: 'Food', cents: 41860, pct: 27 },
  { emoji: '🛒', name: 'Groceries', cents: 32640, pct: 21 },
  { emoji: '🏠', name: 'Bills', cents: 29400, pct: 19 },
  { emoji: '🚌', name: 'Transport', cents: 21720, pct: 14 },
  { emoji: '🎬', name: 'Fun', cents: 17050, pct: 11 },
  { emoji: '💊', name: 'Health', cents: 12430, pct: 8 },
] as const

export const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD · $' },
  { value: 'EUR', label: 'EUR · €' },
  { value: 'GBP', label: 'GBP · £' },
  { value: 'LKR', label: 'LKR · Rs' },
  { value: 'INR', label: 'INR · ₹' },
] as const
