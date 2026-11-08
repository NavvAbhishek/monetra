import { Skeleton } from '@/components/ui/skeleton'

/** Loading placeholder shaped like the Insights page. */
const InsightsSkeleton = () => (
  <div role="status" aria-label="Loading insights" className="flex flex-col gap-5">
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-24 rounded-tile" />
      ))}
    </div>
    <div className="grid gap-5 lg:grid-cols-2">
      <Skeleton className="h-72 rounded-card" />
      <Skeleton className="h-72 rounded-card" />
    </div>
    <Skeleton className="h-80 rounded-card" />
  </div>
)

export default InsightsSkeleton
