import * as Icon from '@/components/icons'

/** Sidebar (desktop) and bottom bar (mobile) links. */
export const NAV_LINKS = [
  { to: '/', label: 'Dashboard', icon: Icon.House },
  { to: '/expenses', label: 'Expenses', icon: Icon.ReceiptText },
  { to: '/categories', label: 'Categories', icon: Icon.LayoutGrid },
] as const

export const SETTINGS_LINK = { to: '/settings', label: 'Settings', icon: Icon.Settings } as const
