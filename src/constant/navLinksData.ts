import * as Icon from '@/components/icons'

/** Sidebar (desktop) and bottom bar (mobile) links. */
export const NAV_LINKS = [
  { to: '/', label: 'Dashboard', icon: Icon.House },
  { to: '/expenses', label: 'Expenses', icon: Icon.ReceiptText },
  { to: '/categories', label: 'Categories', icon: Icon.LayoutGrid },
  // Desktop sidebar only. On phones these are reached from the More tab.
  { to: '/insights', label: 'Insights', icon: Icon.ChartColumn },
  { to: '/assistant', label: 'Ask AI', icon: Icon.Sparkles },
  { to: '/past-spending', label: 'Past spending', icon: Icon.History },
] as const

/** Phones' 4th tab: a hub for Categories, Ask AI, Insights, Past spending and the spending target. */
export const MORE_LINK = { to: '/more', label: 'More', icon: Icon.LayoutGrid } as const

/** Paths that belong to the More tab (it stays highlighted on them). */
export const MORE_TAB_PATHS = ['/more', '/categories', '/insights', '/assistant', '/past-spending'] as const

export const SETTINGS_LINK = { to: '/settings', label: 'Settings', icon: Icon.Settings } as const
