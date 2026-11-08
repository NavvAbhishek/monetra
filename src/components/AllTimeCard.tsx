import { useAllTime } from '@/hooks/use-all-time'
import * as Icon from '@/components/icons'
import { Amount } from '@/components/ui/amount'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { Link } from '@/router/navigation'

/**
 * "All-time total" = before Monetra + tracked in Monetra, with a link to the Past spending page.
 * Hidden until the user has added past spending. It is a separate number: the charts and totals around it stay tracked-only.
 */
const AllTimeCard = ({ className }: { className?: string }) => {
  const { show, currency, pastCents, trackedCents, allTimeCents } = useAllTime()
  if (!show) return null

  return (
    <Card className={className} aria-label="All-time total">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <div className="flex flex-col gap-0.5">
          <CardTitle>All-time total</CardTitle>
          <CardDescription>Before Monetra + tracked in Monetra</CardDescription>
        </div>
        <dl className="flex flex-col gap-1.5 lg:flex-row lg:gap-10">
          <div className="flex items-baseline justify-between gap-3 lg:flex-col lg:justify-start lg:gap-0.5">
            <dt className="text-sm text-muted-foreground">Before Monetra</dt>
            <dd>
              <Amount cents={pastCents} currency={currency} size="md" />
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 lg:flex-col lg:justify-start lg:gap-0.5">
            <dt className="text-sm text-muted-foreground">Tracked in Monetra</dt>
            <dd>
              <Amount cents={trackedCents} currency={currency} size="md" />
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-t border-line pt-1.5 lg:flex-col lg:justify-start lg:gap-0.5 lg:border-t-0 lg:pt-0">
            <dt className="text-sm font-semibold text-ink">All-time</dt>
            <dd>
              <Amount cents={allTimeCents} currency={currency} size="lg" className="text-primary" />
            </dd>
          </div>
        </dl>
        <Link to="/past-spending" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover">
          Past spending
          <Icon.ChevronRight className="size-4" aria-hidden />
        </Link>
      </div>
    </Card>
  )
}

export default AllTimeCard
