import { Skeleton } from '@/components/ui/skeleton'

/** Placeholder rows while expenses load. */
const ExpensesSkeleton = () => (
  <div role="status" aria-label="Loading expenses" className="flex flex-col gap-2 rounded-table bg-card p-4">
    {Array.from({ length: 6 }, (_, i) => (
      <div key={i} className="flex items-center gap-3 py-1.5">
        <Skeleton className="size-10.5 rounded-icon" />
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="h-3 w-1/4" />
        </div>
        <Skeleton className="h-4 w-14" />
      </div>
    ))}
  </div>
)

export default ExpensesSkeleton
