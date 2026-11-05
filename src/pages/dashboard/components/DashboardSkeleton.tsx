import { Skeleton } from '@/components/ui/skeleton'

/** Loading placeholder shaped like the dashboard. */
const DashboardSkeleton = ({ compact }: { compact: boolean }) =>
  compact ? (
    <div role="status" aria-label="Loading dashboard" className="flex flex-col gap-3.5">
      <Skeleton className="h-62 rounded-card" />
      <div className="grid grid-cols-2 gap-2.5">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-tile" />
        ))}
      </div>
    </div>
  ) : (
    <div role="status" aria-label="Loading dashboard" className="flex flex-col gap-5">
      <div className="grid grid-cols-5 gap-5">
        <Skeleton className="col-span-3 h-85 rounded-card" />
        <Skeleton className="col-span-2 h-85 rounded-card" />
      </div>
      <div className="grid grid-cols-2 gap-5">
        <Skeleton className="h-72 rounded-card" />
        <Skeleton className="h-72 rounded-card" />
      </div>
    </div>
  )

export default DashboardSkeleton
