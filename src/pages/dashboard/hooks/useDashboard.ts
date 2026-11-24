import { addDays, format, startOfDay } from 'date-fns'
import { useMemo, useRef, useState } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePastItems } from '@/hooks/use-past-items'
import { useGetCategoriesQuery } from '@/queries/categories/categories-queries'
import { useGetExpensesQuery, useGetExpenseTotalsQuery } from '@/queries/expenses/expenses-queries'
import { useGetPastRecordsQuery } from '@/queries/past-records/past-records-queries'
import { useGetProfileQuery } from '@/queries/profile/profile-queries'
import { useAuthStore } from '@/stores/auth.store'
import { useUIStore } from '@/stores/ui.store'
import type { DashboardPeriod, DateRange, IsoDateRange } from '@/types/period'
import { assignChartTones } from '@/utils/chart-tones'
import { buildStackedBars } from '@/utils/stacked-bars'
import { type Comparison, compareTotals, sumCents, totalsByCategory } from '@/utils/aggregate'
import { DEFAULT_CURRENCY } from '@/utils/money'
import { UNSPLIT_CATEGORY } from '@/utils/pastSpending'
import {
  bucketTotals,
  getAllTimeBuckets,
  getBucketTitle,
  dateRangeToIso,
  getBucketProgress,
  getChartBuckets,
  getPeriodRange,
  getPeriodSubtitle,
  getPreviousPeriod,
  getRangeDays,
  parseIsoDate,
} from '@/utils/period'
import { buildInsights, describeSeries, getBarChartTitle, getFirstName } from '../helpers/DashboardHelpers'

/** Everything the dashboard shows for the selected period (kept in ui.store, so it survives a reload). */
export const useDashboard = () => {
  const isMobile = useIsMobile()
  const user = useAuthStore((s) => s.user)
  const period = useUIStore((s) => s.period)
  const setPeriod = useUIStore((s) => s.setPeriod)
  const customRange = useUIStore((s) => s.customRange)
  const setCustomRange = useUIStore((s) => s.setCustomRange)
  const [now] = useState(() => new Date())

  // ---- ranges ----
  const isAll = period === 'all'
  // "All time" starts at the first tracked expense or the first past record, whichever is earlier
  const totalsQuery = useGetExpenseTotalsQuery({ enabled: isAll })
  const recordsQuery = useGetPastRecordsQuery()
  const allStart = useMemo(() => {
    const starts = [
      ...(totalsQuery.data?.firstSpentAt ? [startOfDay(totalsQuery.data.firstSpentAt).getTime()] : []),
      ...(recordsQuery.data ?? []).map((r) => parseIsoDate(r.start).getTime()),
    ]
    return starts.length > 0 ? new Date(Math.min(...starts)) : null
  }, [totalsQuery.data, recordsQuery.data])

  const range = useMemo<DateRange>(
    () =>
      period === 'all'
        ? { start: allStart ?? startOfDay(now), end: addDays(startOfDay(now), 1) }
        : getPeriodRange(period, now, customRange),
    [period, now, customRange, allStart],
  )
  const previous = useMemo(
    () =>
      period === 'all'
        ? { range: { start: range.start, end: range.start }, name: '', partial: false } // nothing before "all time"
        : getPreviousPeriod(period, range, now),
    [period, range, now],
  )

  // ---- data ----
  // All time reads every tracked expense, so it waits until the first date is known (and only runs on that tab)
  const currentQuery = useGetExpensesQuery(range, { enabled: !isAll || totalsQuery.isSuccess })
  // Range and All time show no comparison, so they skip this read.
  const previousQuery = useGetExpensesQuery(previous.range, { enabled: period !== 'range' && !isAll })
  const categoriesQuery = useGetCategoriesQuery()
  const profileQuery = useGetProfileQuery()

  const currency = profileQuery.data?.currency ?? DEFAULT_CURRENCY
  // past spending that falls in the period is added to the tracked expenses (spread evenly over each record's days)
  const pastNow = usePastItems(range)
  const pastBefore = usePastItems(previous.range)
  const expenses = useMemo(() => [...(currentQuery.data ?? []), ...pastNow.items], [currentQuery.data, pastNow.items])
  const categoryById = useMemo(
    () => new Map([...(categoriesQuery.data ?? []), UNSPLIT_CATEGORY].map((c) => [c.id, c])),
    [categoriesQuery.data],
  )

  // ---- chart ----
  // One set of buckets for both charts: the Month tab uses every day, Week Mon…Sun, Year months, Day 3-hour blocks.
  // All time: one bucket per month, or per year once the history is over 3 years
  const allTime = useMemo(() => (period === 'all' ? getAllTimeBuckets(range) : null), [period, range])
  const chartBuckets = useMemo(() => (period === 'all' ? (allTime?.buckets ?? []) : getChartBuckets(period, range)), [period, range, allTime])
  const lineValues = useMemo(() => bucketTotals(chartBuckets, expenses), [chartBuckets, expenses])
  const lineLabels = chartBuckets.map((b) => b.label)
  const chartProgress = getBucketProgress(chartBuckets, now)
  const lineElapsedCount = chartProgress.elapsedCount
  const subtitle = period === 'all' ? 'All time' : getPeriodSubtitle(period, range, now)

  // ---- totals ----
  const totalCents = sumCents(expenses)
  const comparison: Comparison = isAll
    ? { direction: 'none', percent: 0, text: `Since ${format(range.start, 'MMMM yyyy')}` }
    : compareTotals({
    currentCents: totalCents,
    previousCents: sumCents(previousQuery.data ?? []) + sumCents(pastBefore.items),
    period,
    previous,
    rangeDays: getRangeDays(range),
  })

  const categoryTotals = useMemo(() => {
    const rows = totalsByCategory(expenses).flatMap((t) => {
      const category = categoryById.get(t.categoryId)
      return category ? [{ ...t, category }] : []
    })
    // chart colours: distinct per category (two categories may share a colour in Categories)
    const tones = assignChartTones(rows.map((r) => r.category))
    return rows.map((r) => ({ ...r, tone: tones.get(r.category.id) ?? r.category.colourIndex }))
  }, [expenses, categoryById])

  // stacking order = categories by spending, biggest at the bottom (same order as the donut)
  const stackedBars = useMemo(
    () =>
      buildStackedBars(
        chartBuckets,
        expenses,
        categoryTotals.map((t) => t.category),
        new Map(categoryTotals.map((t) => [t.category.id, t.tone])),
        (bucket) =>
          period === 'all' ? format(bucket.start, allTime?.unit === 'year' ? 'yyyy' : 'MMMM yyyy') : getBucketTitle(period, bucket),
      ),
    [period, allTime, chartBuckets, expenses, categoryTotals],
  )

  // ---- custom range picker ----
  const [pickerOpen, setPickerOpen] = useState(false)
  // Tab to go back to if the picker is cancelled before any custom range was ever chosen.
  const periodBeforeRange = useRef<DashboardPeriod>(period === 'range' ? 'week' : period)

  const openPicker = () => {
    if (period !== 'range') periodBeforeRange.current = period
    setPeriod('range')
    setPickerOpen(true)
  }
  const cancelPicker = () => {
    setPickerOpen(false)
    if (!customRange) setPeriod(periodBeforeRange.current)
  }
  const applyPicker = (picked: IsoDateRange) => {
    setCustomRange(picked)
    setPeriod('range')
    setPickerOpen(false)
  }

  return {
    isMobile,
    now,
    range,
    target: profileQuery.data?.target,
    firstName: getFirstName(user?.name),
    currency,
    // period
    period,
    changePeriod: (next: DashboardPeriod) => (next === 'range' ? openPicker() : setPeriod(next)),
    subtitle,
    barChartTitle: period === 'all' ? `Spending by ${allTime?.unit ?? 'month'}` : getBarChartTitle(period),
    // hero card
    totalCents,
    comparison,
    currentBucketIndex: chartProgress.currentIndex,
    stackedBars,
    lineLabels,
    lineValues,
    lineElapsedCount,
    chartLabel: describeSeries(subtitle, lineLabels, lineValues, currency),
    // lists
    categoryTotals,
    maxCategoryCents: categoryTotals[0]?.cents ?? 0,
    insights: buildInsights(expenses, range, now),
    categoryById,
    // state
    includesPast: pastNow.items.length > 0,
    pastIsEstimate: pastNow.hasEstimates,
    isLoading:
      categoriesQuery.isPending ||
      pastNow.isLoading ||
      (isAll ? totalsQuery.isPending || (totalsQuery.isSuccess && currentQuery.isPending) : currentQuery.isPending),
    isError: currentQuery.isError || categoriesQuery.isError || (isAll && totalsQuery.isError),
    retry: () => {
      void currentQuery.refetch()
      void categoriesQuery.refetch()
    },
    // picker
    pickerOpen,
    pickerInitial: customRange ?? dateRangeToIso(range),
    openPicker,
    cancelPicker,
    applyPicker,
  }
}

export type DashboardCtx = ReturnType<typeof useDashboard>
