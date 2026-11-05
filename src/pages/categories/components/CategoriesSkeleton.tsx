import { Skeleton } from '@/components/ui/skeleton'

/** Placeholder grid while categories load. */
const CategoriesSkeleton = ({ compact }: { compact: boolean }) => (
  <div role="status" aria-label="Loading categories" className={compact ? 'grid grid-cols-2 gap-2.5' : 'grid grid-cols-3 gap-3.5'}>
    {Array.from({ length: 6 }, (_, i) => (
      <Skeleton key={i} className={compact ? 'h-32 rounded-table' : 'h-39.5 rounded-card'} />
    ))}
  </div>
)

export default CategoriesSkeleton
