import { Skeleton } from '@/components/ui/skeleton'

/** Loading placeholder shaped like the dashboard. */
const DashboardSkeleton = ({ compact }: { compact: boolean }) =>
  compact ? (
    <div role="status" aria-label="Loading dashboard" className="flex flex-col gap-3.5">
      <Skeleton className="h-62 rounded-card" />
      <Skeleton className="h-112 rounded-card" />
      <div className="grid grid-cols-2 gap-2.5">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-tile" />
        ))}
      </div>
    </div>
  ) : (
    <div role="status" aria-label="Loading dashboard" className="flex flex-col gap-5">
      <Skeleton className="h-85 rounded-card" />
      <Skeleton className="h-85 rounded-card" />
      <Skeleton className="h-60 rounded-card" />
      <Skeleton className="h-72 rounded-card" />
    </div>
  )

export default DashboardSkeleton
