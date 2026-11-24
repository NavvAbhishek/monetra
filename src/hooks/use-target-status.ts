import { useMemo, useState } from 'react'
import { usePastItems } from '@/hooks/use-past-items'
import { useGetExpensesQuery } from '@/queries/expenses/expenses-queries'
import { useGetProfileQuery } from '@/queries/profile/profile-queries'
import { DEFAULT_CURRENCY } from '@/utils/money'
import { getPeriodRange } from '@/utils/period'
import { getTargetProgress } from '@/utils/target'
import { sumCents } from '@/utils/aggregate'

/**
 * The user's spending target and how this week / month is going against it — for pages that don't already have the
 * period's numbers (More, Settings). Reads the target's current period only (tracked + past spending, like the dashboard).
 */
export const useTargetStatus = () => {
  const profileQuery = useGetProfileQuery()
  const [now] = useState(() => new Date())
  const target = profileQuery.data?.target
  // without a target there is nothing to measure — look at the current month, but don't fetch it
  const range = useMemo(() => getPeriodRange(target?.period ?? 'month', now), [target?.period, now])
  const expensesQuery = useGetExpensesQuery(range, { enabled: !!target })
  const past = usePastItems(range)

  const progress = useMemo(
    () => (target ? getTargetProgress(sumCents(expensesQuery.data ?? []) + sumCents(past.items), target.cents, range, now) : null),
    [target, expensesQuery.data, past.items, range, now],
  )

  return {
    target,
    progress,
    currency: profileQuery.data?.currency ?? DEFAULT_CURRENCY,
    isLoading: profileQuery.isPending || (!!target && (expensesQuery.isPending || past.isLoading)),
  }
}
