import * as Icon from '@/components/icons'
import { cn } from '@/lib/utils'
import type { SpendTarget } from '@/types/profile'
import { formatMoney } from '@/utils/money'
import type { TargetProgress, TargetStatus } from '@/utils/target'

const STATUS_TEXT: Record<TargetStatus, string> = { ok: 'text-muted-foreground', warn: 'text-cat-3-strong', over: 'text-danger' }

/**
 * Compact spending-target row (More page): the same look as the other shortcut rows — icon, title, one line, chevron —
 * with the target and how much is used. The full overview is on the dashboard. The whole row opens the edit dialog.
 */
const TargetSummaryRow = ({ target, progress, currency, onEdit }: { target: SpendTarget; progress: TargetProgress; currency: string; onEdit: () => void }) => (
  <button
    type="button"
    onClick={onEdit}
    aria-label={`Spending target ${formatMoney(target.cents, currency)} per ${target.period}, ${progress.percent}% used. Edit`}
    className="flex w-full cursor-pointer items-center gap-3 rounded-tile bg-card p-4 text-left outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
  >
    <span className="grid size-10.5 shrink-0 place-items-center rounded-icon bg-primary-soft text-primary-hover" aria-hidden>
      <Icon.Target className="size-5" />
    </span>
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="text-base font-bold text-ink">Spending target</span>
      <span className="truncate text-sm text-muted-foreground">
        {formatMoney(target.cents, currency)} per {target.period} ·{' '}
        <span className={cn('font-semibold', STATUS_TEXT[progress.status])}>{progress.status === 'over' ? 'over target' : `${progress.percent}% used`}</span>
      </span>
    </span>
    <Icon.Pencil className="size-4.5 shrink-0 text-muted-foreground" aria-hidden />
  </button>
)

export default TargetSummaryRow
