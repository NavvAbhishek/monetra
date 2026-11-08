import * as Icon from '@/components/icons'
import { Amount } from '@/components/ui/amount'
import { cn } from '@/lib/utils'
import type { ImportCtx } from './hooks/useImportPastSpending'

const PREVIEW_ROWS = 6
const PROBLEMS_SHOWN = 6

const Stat = ({ value, label, tone }: { value: number; label: string; tone: 'success' | 'muted' | 'danger' }) => (
  <div className="flex flex-col rounded-tile bg-card px-4 py-3">
    <span className={cn('text-2xl font-extrabold', tone === 'success' && 'text-success', tone === 'danger' && 'text-danger', tone === 'muted' && 'text-ink')}>{value}</span>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
)

/** Step 3: what the file contains — counts, the first rows, and every row that can't be imported (with the reason). */
const ImportPreview = ({ ctx, currency }: { ctx: ImportCtx; currency: string }) => {
  const preview = ctx.preview
  if (!preview) return null
  const shown = ctx.readyRows.slice(0, PREVIEW_ROWS)
  const problems = preview.problems

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2.5">
        <Stat value={ctx.readyRows.length} label="Ready to import" tone="success" />
        <Stat value={ctx.duplicateCount} label="Already added" tone="muted" />
        <Stat value={problems.length} label="Problems found" tone="danger" />
      </div>

      {shown.length > 0 && (
        <div className="flex flex-col rounded-table bg-card px-4 py-1">
          <p className="py-2 text-sm font-semibold text-muted-foreground">
            {ctx.readyRows.length > shown.length ? `First ${shown.length} of ${ctx.readyRows.length}` : 'These will be added'}
          </p>
          <ul>
            {shown.map((row) => (
              <li key={row.line} className="flex items-center gap-3 border-t border-line-soft py-2.5">
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-base font-semibold text-ink">{row.periodLabel}</span>
                  <span className="truncate text-xs text-muted-foreground">{row.categoryLabel}</span>
                </div>
                <Amount cents={row.input.amountCents} currency={currency} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {ctx.duplicateCount > 0 && (
        <p className="text-sm text-muted-foreground">
          {ctx.duplicateCount} {ctx.duplicateCount === 1 ? 'amount is' : 'amounts are'} already in your past spending (same period, category and amount) and will be skipped.
        </p>
      )}

      {ctx.overlapCount > 0 && (
        <p className="flex items-start gap-2 rounded-tile bg-cat-3-soft px-3.5 py-3 text-sm text-ink" role="status">
          <Icon.TriangleAlert className="mt-0.5 size-4 shrink-0 text-cat-3-strong" aria-hidden />
          <span>
            {ctx.overlapCount} {ctx.overlapCount === 1 ? 'record reaches' : 'records reach'} the days you already track in Monetra, so your all-time total may count that spending twice.
          </span>
        </p>
      )}

      {problems.length > 0 && (
        <div className="flex flex-col gap-1.5 rounded-table bg-danger-soft px-4 py-3" role="alert">
          <p className="text-sm font-bold text-danger">These will be skipped — fix them in the file and upload again if you need them:</p>
          <ul className="flex flex-col gap-1 text-sm text-ink">
            {problems.slice(0, PROBLEMS_SHOWN).map((p) => (
              <li key={p.line}>
                <span className="font-semibold">{p.line === 1 ? 'Header:' : `Row ${p.line}:`}</span> {p.message}
              </li>
            ))}
          </ul>
          {problems.length > PROBLEMS_SHOWN && <p className="text-sm text-muted-foreground">…and {problems.length - PROBLEMS_SHOWN} more.</p>}
        </div>
      )}
    </div>
  )
}

export default ImportPreview
