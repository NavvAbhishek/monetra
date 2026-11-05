import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_THEME_COLOR, type ThemeColorId } from '@/constant/themeColors'
import type { IsoDateRange, PeriodKey } from '@/types/period'

interface UIState {
  /** Selected dashboard period tab. */
  period: PeriodKey
  /** Custom range for the "Range" tab (ISO strings so it survives a reload). */
  customRange: IsoDateRange | null
  /** Pre-selects the category in the Add expense form. */
  lastCategoryId: string | null
  /** App colour picked in Settings (saved on this device). */
  themeColor: ThemeColorId
  setPeriod: (period: PeriodKey) => void
  setCustomRange: (range: IsoDateRange | null) => void
  setLastCategoryId: (id: string | null) => void
  setThemeColor: (id: ThemeColorId) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      period: 'week',
      customRange: null,
      lastCategoryId: null,
      themeColor: DEFAULT_THEME_COLOR,
      setPeriod: (period) => set({ period }),
      setCustomRange: (customRange) => set({ customRange }),
      setLastCategoryId: (lastCategoryId) => set({ lastCategoryId }),
      setThemeColor: (themeColor) => set({ themeColor }),
    }),
    { name: 'monetra-ui', version: 1 },
  ),
)
