import * as Icon from '@/components/icons'
import { Button } from '@/components/ui/button'
import { IS_MOCK_BACKEND } from '@/lib/env'
import type { SettingsCtx } from '../hooks/useSettings'
import SettingsSection from './SettingsSection'

/** CSV export (+ reset of the demo data while running on the mock backend). */
const DataSection = ({ ctx }: { ctx: SettingsCtx }) => (
  <SettingsSection
    title="Your data"
    description="Download every expense as a CSV file — opens in Excel, Numbers and Google Sheets. A good yearly backup."
  >
    <div className="flex flex-wrap gap-2.5">
      <Button variant="outline" size="md" loading={ctx.isExporting} onClick={ctx.exportCsv}>
        {!ctx.isExporting && <Icon.Download aria-hidden />}
        Download CSV
      </Button>
      {IS_MOCK_BACKEND && (
        <Button variant="danger-ghost" size="md" loading={ctx.isResettingMock} onClick={ctx.resetMockData}>
          Reset demo data
        </Button>
      )}
    </div>
    {IS_MOCK_BACKEND && (
      <p className="text-xs text-muted-foreground">Demo mode: “Reset demo data” deletes everything stored in this browser and logs you out.</p>
    )}
  </SettingsSection>
)

export default DataSection
