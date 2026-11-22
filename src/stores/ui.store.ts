import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type AssistantModelId, DEFAULT_ASSISTANT_MODEL } from '@/constant/assistantModels'
import { DEFAULT_THEME_COLOR, type ThemeColorId } from '@/constant/themeColors'
import type { DashboardPeriod, IsoDateRange } from '@/types/period'

interface UIState {
  /** Selected dashboard period tab. */
  period: DashboardPeriod
  /** Custom range for the "Range" tab (ISO strings so it survives a reload). */
  customRange: IsoDateRange | null
  /** Pre-selects the category in the Add expense form. */
  lastCategoryId: string | null
  /** App colour picked in Settings (saved on this device). */
  themeColor: ThemeColorId
  /** Desktop sidebar shrunk to an icon strip (saved on this device). */
  sidebarCollapsed: boolean
  /** Gemini model picked on the Ask AI page (saved on this device). */
  assistantModel: AssistantModelId
  setPeriod: (period: DashboardPeriod) => void
  setCustomRange: (range: IsoDateRange | null) => void
  setLastCategoryId: (id: string | null) => void
  setThemeColor: (id: ThemeColorId) => void
  toggleSidebar: () => void
  setAssistantModel: (id: AssistantModelId) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      period: 'week',
      customRange: null,
      lastCategoryId: null,
      themeColor: DEFAULT_THEME_COLOR,
      sidebarCollapsed: false,
      assistantModel: DEFAULT_ASSISTANT_MODEL,
      setPeriod: (period) => set({ period }),
      setCustomRange: (customRange) => set({ customRange }),
      setLastCategoryId: (lastCategoryId) => set({ lastCategoryId }),
      setThemeColor: (themeColor) => set({ themeColor }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setAssistantModel: (assistantModel) => set({ assistantModel }),
    }),
    { name: 'monetra-ui', version: 1 },
  ),
)
