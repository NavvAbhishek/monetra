import { useMemo, useState } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import { useGetCategoriesQuery } from '@/queries/categories/categories-queries'
import { useGetExpensesQuery } from '@/queries/expenses/expenses-queries'
import { useGetProfileQuery } from '@/queries/profile/profile-queries'
import { totalsByCategory } from '@/utils/aggregate'
import { assignChartTones } from '@/utils/chart-tones'
import { DEFAULT_CURRENCY } from '@/utils/money'
import { getPeriodRange, getPeriodSubtitle, getPreviousPeriod, isInRange, shiftAnchor } from '@/utils/period'
import {
  buildCategoryChanges,
  buildSummary,
  buildWeekdayBars,
  getDelta,
  getHeading,
  getTopExpenses,
  type InsightsPeriod,
} from '../helpers/InsightsHelpers'

/** Everything the Insights page shows for the selected week / month / year (local state, like the Expenses page). */
export const useInsights = () => {
  const isMobile = useIsMobile()
  const [now] = useState(() => new Date())
  const [period, setPeriod] = useState<InsightsPeriod>('month')
  const [anchor, setAnchor] = useState(now)

  const range = useMemo(() => getPeriodRange(period, anchor), [period, anchor])
  const previous = useMemo(() => getPreviousPeriod(period, range, now), [period, range, now])
  const isCurrentPeriod = isInRange(now, range)

  const currentQuery = useGetExpensesQuery(range)
  const previousQuery = useGetExpensesQuery(previous.range)
  const categoriesQuery = useGetCategoriesQuery()
  const profileQuery = useGetProfileQuery()

  const currency = profileQuery.data?.currency ?? DEFAULT_CURRENCY
  const expenses = useMemo(() => currentQuery.data ?? [], [currentQuery.data])
  const previousExpenses = useMemo(() => previousQuery.data ?? [], [previousQuery.data])
  const categoryById = useMemo(() => new Map((categoriesQuery.data ?? []).map((c) => [c.id, c])), [categoriesQuery.data])

  const summary = useMemo(() => buildSummary(expenses, range, now), [expenses, range, now])
  const previousTotalCents = useMemo(() => previousExpenses.reduce((total, e) => total + e.amountCents, 0), [previousExpenses])
  const weekdayBars = useMemo(() => buildWeekdayBars(expenses, range, now), [expenses, range, now])
  const categoryChanges = useMemo(() => {
    // same distinct colours as the dashboard: biggest category first keeps its colour
    const ordered = totalsByCategory(expenses).flatMap((t) => categoryById.get(t.categoryId) ?? [])
    const extra = [...categoryById.values()].filter((c) => !ordered.some((o) => o.id === c.id))
    const tones = assignChartTones([...ordered, ...extra])
    return buildCategoryChanges(expenses, previousExpenses, categoryById, tones)
  }, [expenses, previousExpenses, categoryById])
  const topExpenses = useMemo(() => getTopExpenses(expenses), [expenses])

  const subtitle = getPeriodSubtitle(period, range, now)

  return {
    isMobile,
    currency,
    // period
    period,
    setPeriod,
    periodLabel: subtitle,
    heading: getHeading(period, isCurrentPeriod, subtitle),
    isCurrentPeriod,
    goPrevious: () => setAnchor((a) => shiftAnchor(period, a, -1)),
    goNext: () => setAnchor((a) => shiftAnchor(period, a, 1)),
    // data
    summary,
    totalDelta: getDelta(summary.totalCents, previousTotalCents),
    previousName: previous.name,
    previousPartial: previous.partial,
    weekdayBars,
    categoryChanges,
    categoryById,
    topExpenses,
    // state
    isLoading: currentQuery.isPending || categoriesQuery.isPending,
    isError: currentQuery.isError || categoriesQuery.isError,
    retry: () => {
      void currentQuery.refetch()
      void previousQuery.refetch()
      void categoriesQuery.refetch()
    },
  }
}

export type InsightsCtx = ReturnType<typeof useInsights>
