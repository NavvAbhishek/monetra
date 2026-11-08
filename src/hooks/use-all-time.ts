import { useGetExpenseTotalsQuery } from '@/queries/expenses/expenses-queries'
import { useGetPastRecordsQuery } from '@/queries/past-records/past-records-queries'
import { useGetProfileQuery } from '@/queries/profile/profile-queries'
import { DEFAULT_CURRENCY } from '@/utils/money'

/**
 * Before Monetra + tracked in Monetra = all-time total, for the small "All-time total" card on the dashboard and Insights.
 * Only the SEPARATE total — past spending never changes the period numbers or charts (CLAUDE.md §7.5).
 * The tracked total (a server-side sum) is only fetched once the user has at least one past record.
 */
export const useAllTime = () => {
  const recordsQuery = useGetPastRecordsQuery()
  const hasRecords = (recordsQuery.data?.length ?? 0) > 0
  const totalsQuery = useGetExpenseTotalsQuery({ enabled: hasRecords })
  const profileQuery = useGetProfileQuery()

  const pastCents = (recordsQuery.data ?? []).reduce((sum, r) => sum + r.amountCents, 0)
  const trackedCents = totalsQuery.data?.totalCents ?? 0

  return {
    /** Show the card only when there is something to add up. */
    show: hasRecords && totalsQuery.isSuccess,
    currency: profileQuery.data?.currency ?? DEFAULT_CURRENCY,
    pastCents,
    trackedCents,
    allTimeCents: pastCents + trackedCents,
  }
}
