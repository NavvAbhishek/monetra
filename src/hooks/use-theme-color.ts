import { useEffect } from 'react'
import { applyThemeColor } from '@/lib/theme'
import { useUIStore } from '@/stores/ui.store'

/** Mount once (App.tsx): re-applies the theme colour whenever it changes in Settings. */
export const useThemeColor = () => {
  const themeColor = useUIStore((s) => s.themeColor)
  useEffect(() => applyThemeColor(themeColor), [themeColor])
}
