import * as Icon from '@/components/icons'
import { Amount } from '@/components/ui/amount'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { IconButton } from '@/components/ui/icon-button'
import { formatPastPeriod, overlapsTracking } from '@/utils/pastSpending'
import type { PastSpendingCtx } from '../hooks/usePastSpending'

/** The past-spending records, newest period first, with edit / delete. */
const PastRecordList = ({ ctx }: { ctx: PastSpendingCtx }) => {
  if (ctx.records.length === 0) {
    return (
      <EmptyState
        emoji="🗂️"
        title="No past spending yet"
        description="Moving from another app? Add what you spent there — by month, year or any date range. It stays out of your dashboard."
        action={<Button onClick={ctx.openNew}>+ Add past spending</Button>}
      />
    )
  }

  return (
    <Card radius="table">
      <CardHeader>
        <CardTitle>Past records</CardTitle>
        <span className="text-sm text-muted-foreground">
          {ctx.records.length} {ctx.records.length === 1 ? 'record' : 'records'}
        </span>
      </CardHeader>
      <ul className="flex flex-col">
        {ctx.records.map((record) => {
          const category = record.categoryId ? ctx.categoryById.get(record.categoryId) : undefined
          const period = formatPastPeriod(record)
          const overlap = overlapsTracking(record.end, ctx.firstTrackedAt)
          return (
            <li key={record.id} className="flex items-center gap-3 border-b border-line-soft py-3 last:border-b-0">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-ink">{period}</span>
                  {category ? (
                    <Badge tone={category.colourIndex} size="sm">
                      {category.emoji} {category.name}
                    </Badge>
                  ) : (
                    <Badge tone="neutral" size="sm">
                      All categories
                    </Badge>
                  )}
                </div>
                {record.note && <span className="truncate text-sm text-muted-foreground">{record.note}</span>}
                {overlap && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-cat-3-strong">
                    <Icon.TriangleAlert className="size-3.5" aria-hidden />
                    Overlaps the time you’ve tracked in Monetra
                  </span>
                )}
              </div>
              <Amount cents={record.amountCents} currency={ctx.currency} className="text-md" />
              <div className="flex gap-1.5">
                <IconButton variant="muted" size="sm" aria-label={`Edit ${period}`} onClick={() => ctx.openEdit(record)}>
                  <Icon.Pencil aria-hidden />
                </IconButton>
                <IconButton variant="danger-soft" size="sm" aria-label={`Delete ${period}`} onClick={() => ctx.askDelete(record)}>
                  <Icon.Trash2 aria-hidden />
                </IconButton>
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

export default PastRecordList
