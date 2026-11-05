import { Button } from '@/components/ui/button'
import { DEFAULT_THEME_COLOR } from '@/constant/themeColors'
import type { SettingsCtx } from '../hooks/useSettings'
import SettingsSection from './SettingsSection'
import ThemeColorPicker from './ThemeColorPicker'

/** Theme colour — recolours buttons, links, charts and highlights everywhere. Saved on this device. */
const AppearanceSection = ({ ctx }: { ctx: SettingsCtx }) => (
  <SettingsSection title="Theme colour" description="Changes buttons, links, charts and highlights across the app. Saved on this device.">
    <ThemeColorPicker value={ctx.themeColor} onChange={ctx.setThemeColor} />
    {/* live preview of the colour in use */}
    <div className="flex flex-wrap items-center gap-2.5 rounded-panel bg-bg p-3.5">
      <Button size="sm">Primary</Button>
      <Button size="sm" variant="secondary">
        Secondary
      </Button>
      <span className="text-sm font-semibold text-primary">Link colour</span>
      <span className="h-2 w-24 overflow-hidden rounded-full bg-bar">
        <span className="block h-full w-2/3 bg-primary" />
      </span>
      {ctx.themeColor !== DEFAULT_THEME_COLOR && (
        <Button size="sm" variant="ghost" className="ml-auto" onClick={() => ctx.setThemeColor(DEFAULT_THEME_COLOR)}>
          Reset to default
        </Button>
      )}
    </div>
  </SettingsSection>
)

export default AppearanceSection
