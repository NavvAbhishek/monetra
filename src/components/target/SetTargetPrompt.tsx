import * as Icon from '@/components/icons'

/**
 * "Set a spending target" row (no target yet). Same look as the shortcut rows on the More page —
 * icon, title, one line, chevron — and the whole row opens the target dialog. `unit` = what the target would repeat on.
 */
const SetTargetPrompt = ({ unit, onSet }: { unit: 'week' | 'month'; onSet: () => void }) => (
  <button
    type="button"
    onClick={onSet}
    className="flex w-full cursor-pointer items-center gap-3 rounded-tile bg-card p-4 text-left outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
  >
    <span className="grid size-10.5 shrink-0 place-items-center rounded-icon bg-primary-soft text-primary-hover" aria-hidden>
      <Icon.Target className="size-5" />
    </span>
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="text-base font-bold text-ink">Set a spending target</span>
      <span className="truncate text-sm text-muted-foreground">How much to spend each {unit}, tracked here</span>
    </span>
    <Icon.ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
  </button>
)

export default SetTargetPrompt
