import { useState } from 'react'
import * as Icon from '@/components/icons'
import TargetDialog from '@/components/target/TargetDialog'
import { Amount } from '@/components/ui/amount'
import { Button } from '@/components/ui/button'
import { DEFAULT_CURRENCY } from '@/utils/money'
import type { SettingsCtx } from '../hooks/useSettings'
import SettingsSection from './SettingsSection'

/** Desktop: set / change / remove the spending target here too (phones manage it from the More tab). */
const TargetSection = ({ ctx }: { ctx: SettingsCtx }) => {
  const [editing, setEditing] = useState(false)
  const target = ctx.profile?.target
  const currency = ctx.profile?.currency ?? DEFAULT_CURRENCY

  return (
    <SettingsSection title="Spending target" description="How much you want to spend at most each week or month. Progress shows on the dashboard.">
      <div className="flex flex-wrap items-center gap-3">
        {target ? (
          <p className="flex items-baseline gap-1.5 text-base text-muted-foreground">
            <Amount cents={target.cents} currency={currency} size="lg" />
            per {target.period}
          </p>
        ) : (
          <p className="text-base text-muted-foreground">No target set.</p>
        )}
        <Button variant="outline" onClick={() => setEditing(true)} disabled={!ctx.profile}>
          <Icon.Target aria-hidden />
          {target ? 'Edit target' : 'Set target'}
        </Button>
      </div>
      {editing && <TargetDialog current={target} currency={currency} defaultPeriod="month" onClose={() => setEditing(false)} />}
    </SettingsSection>
  )
}

export default TargetSection
