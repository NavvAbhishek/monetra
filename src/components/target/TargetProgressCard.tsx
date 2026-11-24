import type { ReactNode } from 'react'
import * as Icon from '@/components/icons'
import { Amount } from '@/components/ui/amount'
import { Card, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { SpendTarget } from '@/types/profile'
import type { TargetProgress, TargetStatus } from '@/utils/target'

/** Bar colour by status: purple (fine) · amber from 80 % · red when over. Amber = the category colour 3. */
const BAR_TONE = { ok: 'primary', warn: 3, over: 'danger' } as const
const STATUS_TEXT: Record<TargetStatus, string> = { ok: 'text-ink', warn: 'text-cat-3-strong', over: 'text-danger' }

const Stat = ({ label, value, hint }: { label: string; value: ReactNode; hint: string }) => (
  <div className="flex min-w-0 flex-col gap-0.5 rounded-tile bg-bg px-3.5 py-3">
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className="flex min-w-0 flex-col">
      <span className="truncate font-extrabold text-ink">{value}</span>
      <span className="truncate text-xs text-muted-foreground">{hint}</span>
    </dd>
  </div>
)

type Props = {
  target: SpendTarget
  progress: TargetProgress
  currency: string
  /** The Edit button (a `<Button>` or `<Link>`); omit for a read-only card. */
  action?: ReactNode
}

/**
 * Spending target progress (user request 2026-11-22): spent of target, % used, what is left, what can still be spent per day,
 * and whether the current pace stays inside it. Colour + text warnings only (amber from 80 %, red when over).
 */
const TargetProgressCard = ({ target, progress, currency, action }: Props) => {
  const unit = target.period === 'month' ? 'month' : 'week'
  const days = `${progress.daysLeft} ${progress.daysLeft === 1 ? 'day' : 'days'}`

  return (
    <Card padding="md" className="gap-3" aria-label={`Spending target for this ${unit}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <CardTitle className="text-lg">Spending target · this {unit}</CardTitle>
          <p className="flex flex-wrap items-baseline gap-x-1.5 text-base">
            <Amount cents={progress.spentCents} currency={currency} size="lg" className={STATUS_TEXT[progress.status]} />
            <span className="text-muted-foreground">of</span>
            <Amount cents={progress.targetCents} currency={currency} size="sm" tone="muted" />
          </p>
        </div>
        {action}
      </div>

      <div className="flex flex-col gap-1.5">
        <Progress value={Math.min(100, progress.percent)} tone={BAR_TONE[progress.status]} label={`${progress.percent}% of your ${unit}ly target used`} className="h-2.5" />
        <div className="flex justify-between text-xs font-semibold">
          <span className={STATUS_TEXT[progress.status]}>{progress.percent}% used</span>
          {progress.status !== 'over' && <span className="text-muted-foreground">{100 - Math.min(100, progress.percent)}% left</span>}
        </div>
      </div>

      {progress.status === 'over' ? (
        <p role="alert" className="flex items-start gap-2 rounded-tile bg-danger-soft px-3.5 py-2.5 text-sm font-semibold text-danger">
          <Icon.TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            <Amount cents={progress.overCents} currency={currency} className="text-sm" /> over your {unit}ly target
            {progress.daysLeft > 1 ? ` — with ${days} still to go` : ''}.
          </span>
        </p>
      ) : (
        <dl className="grid gap-2 sm:grid-cols-3">
          <Stat label="Left" value={<Amount cents={progress.leftCents} currency={currency} size="md" />} hint={`${days} to go`} />
          <Stat label="You can spend per day" value={<Amount cents={progress.perDayCents} currency={currency} size="md" />} hint="to stay inside it" />
          <Stat
            label="At your current pace"
            value={<Amount cents={progress.projectedCents} currency={currency} size="md" className={cn(progress.paceOver && 'text-cat-3-strong')} />}
            hint={progress.paceOver ? 'You would go over' : 'On track'}
          />
        </dl>
      )}
    </Card>
  )
}

export default TargetProgressCard
