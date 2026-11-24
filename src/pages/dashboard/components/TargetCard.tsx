import { useState } from 'react'
import * as Icon from '@/components/icons'
import SetTargetPrompt from '@/components/target/SetTargetPrompt'
import TargetDialog from '@/components/target/TargetDialog'
import TargetProgressCard from '@/components/target/TargetProgressCard'
import { Button } from '@/components/ui/button'
import { Link } from '@/router/navigation'
import { getTargetProgress } from '@/utils/target'
import type { DashboardCtx } from '../hooks/useDashboard'

/**
 * Spending target on the dashboard Week / Month tab that matches it (a monthly target on Month, a weekly one on Week).
 * Desktop: can set / edit right here. Phones: only the progress shows, and "Edit" goes to the More tab where it is managed
 * (no "set a target" prompt on the phone dashboard — it keeps that screen light).
 */
const TargetCard = ({ ctx }: { ctx: DashboardCtx }) => {
  const [editing, setEditing] = useState(false)
  const { period, target, currency, isMobile } = ctx
  if (period !== 'week' && period !== 'month') return null
  if (target && target.period !== period) return null

  if (!target) {
    if (isMobile) return null
    return (
      <>
        <SetTargetPrompt unit={period} onSet={() => setEditing(true)} />
        {editing && <TargetDialog current={undefined} currency={currency} defaultPeriod={period} onClose={() => setEditing(false)} />}
      </>
    )
  }

  const progress = getTargetProgress(ctx.totalCents, target.cents, ctx.range, ctx.now)
  const action = isMobile ? (
    <Button asChild size="sm" variant="surface">
      <Link to="/more">
        <Icon.Pencil aria-hidden />
        Edit
      </Link>
    </Button>
  ) : (
    <Button size="sm" variant="surface" onClick={() => setEditing(true)} aria-label="Edit spending target">
      <Icon.Pencil aria-hidden />
      Edit
    </Button>
  )

  return (
    <>
      <TargetProgressCard target={target} progress={progress} currency={currency} action={action} />
      {editing && <TargetDialog current={target} currency={currency} defaultPeriod={period} onClose={() => setEditing(false)} />}
    </>
  )
}

export default TargetCard
