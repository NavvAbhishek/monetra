import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { IsoDateRange, PeriodKey } from '@/types/period'

interface UIState {
  /** Selected dashboard period tab. */
  period: PeriodKey
  /** Custom range for the "Range" tab (ISO strings so it survives a reload). */
  customRange: IsoDateRange | null
  /** Pre-selects the category in the Add expense form. */
  lastCategoryId: string | null
  setPeriod: (period: PeriodKey) => void
  setCustomRange: (range: IsoDateRange | null) => void
  setLastCategoryId: (id: string | null) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      period: 'week',
      customRange: null,
      lastCategoryId: null,
      setPeriod: (period) => set({ period }),
      setCustomRange: (customRange) => set({ customRange }),
      setLastCategoryId: (lastCategoryId) => set({ lastCategoryId }),
    }),
    { name: 'monetra-ui', version: 1 },
  ),
)
