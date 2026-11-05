import { useState } from 'react'
import * as Icon from '@/components/icons'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { IS_MOCK_BACKEND } from '@/lib/env'
import type { SettingsCtx } from '../hooks/useSettings'
import SettingsSection from './SettingsSection'

/** CSV export (+ reset of the demo data while running on the mock backend). */
const DataSection = ({ ctx }: { ctx: SettingsCtx }) => {
  const [confirmReset, setConfirmReset] = useState(false)
  return (
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
          <Button variant="danger-ghost" size="md" onClick={() => setConfirmReset(true)}>
            Reset demo data
          </Button>
        )}
      </div>
      {IS_MOCK_BACKEND && (
        <>
          <p className="text-xs text-muted-foreground">Demo mode: “Reset demo data” deletes everything stored in this browser and logs you out.</p>
          <ConfirmDialog
            open={confirmReset}
            onOpenChange={setConfirmReset}
            title="Reset demo data?"
            description="Everything stored in this browser is deleted and you are logged out. This can’t be undone."
            confirmLabel="Reset"
            loading={ctx.isResettingMock}
            onConfirm={ctx.resetMockData}
          />
        </>
      )}
    </SettingsSection>
  )
}

export default DataSection
