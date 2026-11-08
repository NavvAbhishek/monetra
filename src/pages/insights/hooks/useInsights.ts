import { useMemo, useState } from 'react'
import { addDays, format, startOfDay } from 'date-fns'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePastItems } from '@/hooks/use-past-items'
import { useGetCategoriesQuery } from '@/queries/categories/categories-queries'
import { useGetExpensesQuery, useGetExpenseTotalsQuery } from '@/queries/expenses/expenses-queries'
import { useGetPastRecordsQuery } from '@/queries/past-records/past-records-queries'
import { useGetProfileQuery } from '@/queries/profile/profile-queries'
import { totalsByCategory } from '@/utils/aggregate'
import type { DateRange } from '@/types/period'
import { assignChartTones } from '@/utils/chart-tones'
import { DEFAULT_CURRENCY } from '@/utils/money'
import { UNSPLIT_CATEGORY } from '@/utils/pastSpending'
import { getAllTimeBuckets, getPeriodRange, getRangeDays, getPeriodSubtitle, getPreviousPeriod, isInRange, parseIsoDate, shiftAnchor } from '@/utils/period'
import { buildStackedBars } from '@/utils/stacked-bars'
import {
  buildCategoryChanges,
  buildSummary,
  buildYearSummaries,
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

  const isAll = period === 'all'

  // "All time" starts at the first tracked expense or the first past record, whichever is earlier
  const totalsQuery = useGetExpenseTotalsQuery({ enabled: isAll })
  const recordsQuery = useGetPastRecordsQuery()
  const allStart = useMemo(() => {
    const starts = [
      ...(totalsQuery.data?.firstSpentAt ? [startOfDay(totalsQuery.data.firstSpentAt)] : []),
      ...(recordsQuery.data ?? []).map((r) => parseIsoDate(r.start)),
    ]
    return starts.length > 0 ? new Date(Math.min(...starts.map((d) => d.getTime()))) : null
  }, [totalsQuery.data, recordsQuery.data])

  const range = useMemo<DateRange>(() => {
    if (!isAll) return getPeriodRange(period, anchor)
    const tomorrow = addDays(startOfDay(now), 1)
    return { start: allStart ?? startOfDay(now), end: tomorrow }
  }, [isAll, period, anchor, allStart, now])
  const previous = useMemo(
    () =>
      isAll
        ? { range: { start: range.start, end: range.start }, name: '', partial: false } // nothing before "all time"
        : getPreviousPeriod(period, range, now),
    [isAll, period, range, now],
  )
  const isCurrentPeriod = isAll || isInRange(now, range)

  const currentQuery = useGetExpensesQuery(range, { enabled: !isAll || totalsQuery.isSuccess })
  const previousQuery = useGetExpensesQuery(previous.range, { enabled: !isAll })
  const categoriesQuery = useGetCategoriesQuery()
  const profileQuery = useGetProfileQuery()

  const currency = profileQuery.data?.currency ?? DEFAULT_CURRENCY
  // past spending that falls in the period is added to the tracked expenses (spread evenly over each record's days)
  const pastNow = usePastItems(range)
  const pastBefore = usePastItems(previous.range)
  const realExpenses = useMemo(() => currentQuery.data ?? [], [currentQuery.data])
  const expenses = useMemo(() => [...realExpenses, ...pastNow.items], [realExpenses, pastNow.items])
  const previousExpenses = useMemo(() => [...(previousQuery.data ?? []), ...pastBefore.items], [previousQuery.data, pastBefore.items])
  const categoryById = useMemo(
    () => new Map([...(categoriesQuery.data ?? []), UNSPLIT_CATEGORY].map((c) => [c.id, c])),
    [categoriesQuery.data],
  )

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
  const topExpenses = useMemo(() => getTopExpenses(realExpenses), [realExpenses]) // real expenses only

  // Year and All time: spending per month (per year once the history is over 3 years) split by category
  const trend = useMemo(() => {
    if (period !== 'year' && period !== 'all') return null
    const { buckets, unit } = getAllTimeBuckets(range)
    const ordered = totalsByCategory(expenses).flatMap((t) => categoryById.get(t.categoryId) ?? [])
    const tones = assignChartTones(ordered)
    const bars = buildStackedBars(buckets, expenses, ordered, tones, (b) => (unit === 'year' ? format(b.start, 'yyyy') : format(b.start, 'MMMM yyyy')))
    const current = buckets.findIndex((b) => now >= b.start && now < b.end)
    return { bars, unit, currentIndex: current >= 0 ? current : null }
  }, [period, range, expenses, categoryById, now])
  const yearSummaries = useMemo(() => (isAll ? buildYearSummaries(expenses, range, now) : []), [isAll, expenses, range, now])
  // "on track for …": this week / month / year so far, at the same daily pace
  const periodDays = getRangeDays(range)
  const projectedCents =
    !isAll && isCurrentPeriod && summary.days > 0 && summary.days < periodDays && summary.totalCents > 0
      ? Math.round((summary.totalCents / summary.days) * periodDays)
      : null

  const subtitle = getPeriodSubtitle(isAll ? 'range' : period, range, now)

  return {
    isMobile,
    currency,
    // period
    period,
    setPeriod,
    periodLabel: subtitle,
    heading: getHeading(period, isCurrentPeriod, subtitle),
    isCurrentPeriod,
    goPrevious: () => !isAll && setAnchor((a) => shiftAnchor(period, a, -1)),
    goNext: () => !isAll && setAnchor((a) => shiftAnchor(period, a, 1)),
    // data
    summary,
    totalDelta: getDelta(summary.totalCents, previousTotalCents),
    isAll,
    hasAnyData: !isAll || allStart !== null,
    trend,
    yearSummaries,
    projectedCents,
    previousName: previous.name,
    previousPartial: previous.partial,
    weekdayBars,
    categoryChanges,
    categoryById,
    topExpenses,
    // state
    includesPast: pastNow.items.length > 0,
    isLoading:
      categoriesQuery.isPending ||
      pastNow.isLoading ||
      (isAll ? totalsQuery.isPending || (totalsQuery.isSuccess && currentQuery.isPending) : currentQuery.isPending),
    isError: currentQuery.isError || categoriesQuery.isError || (isAll && totalsQuery.isError),
    retry: () => {
      void currentQuery.refetch()
      void previousQuery.refetch()
      void categoriesQuery.refetch()
    },
  }
}

export type InsightsCtx = ReturnType<typeof useInsights>
