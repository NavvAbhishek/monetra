import * as Icon from '@/components/icons'

/** Sidebar (desktop) and bottom bar (mobile) links. */
export const NAV_LINKS = [
  { to: '/', label: 'Dashboard', icon: Icon.House },
  { to: '/expenses', label: 'Expenses', icon: Icon.ReceiptText },
  { to: '/categories', label: 'Categories', icon: Icon.LayoutGrid },
  // Desktop sidebar only (the tab bar is full). On phones: Insights via "See all" on the dashboard, Past spending via Settings.
  { to: '/insights', label: 'Insights', icon: Icon.ChartColumn },
  { to: '/past-spending', label: 'Past spending', icon: Icon.History },
] as const

export const SETTINGS_LINK = { to: '/settings', label: 'Settings', icon: Icon.Settings } as const
