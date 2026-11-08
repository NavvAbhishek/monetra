import { useMemo, useRef, useState } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import { useGetCategoriesQuery } from '@/queries/categories/categories-queries'
import { useGetExpensesQuery } from '@/queries/expenses/expenses-queries'
import { useGetProfileQuery } from '@/queries/profile/profile-queries'
import { useAuthStore } from '@/stores/auth.store'
import { useUIStore } from '@/stores/ui.store'
import type { IsoDateRange, PeriodKey } from '@/types/period'
import { compareTotals, sumCents, totalsByCategory } from '@/utils/aggregate'
import { DEFAULT_CURRENCY } from '@/utils/money'
import {
  bucketTotals,
  dateRangeToIso,
  getBucketProgress,
  getChartBuckets,
  getPeriodRange,
  getPeriodSubtitle,
  getPreviousPeriod,
  getRangeDays,
} from '@/utils/period'
import { assignChartTones, buildInsights, buildStackedBars, describeSeries, getFirstName } from '../helpers/DashboardHelpers'

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
  const range = useMemo(() => getPeriodRange(period, now, customRange), [period, now, customRange])
  const previous = useMemo(() => getPreviousPeriod(period, range, now), [period, range, now])

  // ---- data ----
  const currentQuery = useGetExpensesQuery(range)
  // The Range tab shows "Custom range · N days" instead of a comparison, so it skips this read.
  const previousQuery = useGetExpensesQuery(previous.range, { enabled: period !== 'range' })
  const categoriesQuery = useGetCategoriesQuery()
  const profileQuery = useGetProfileQuery()

  const currency = profileQuery.data?.currency ?? DEFAULT_CURRENCY
  const expenses = useMemo(() => currentQuery.data ?? [], [currentQuery.data])
  const categoryById = useMemo(() => new Map((categoriesQuery.data ?? []).map((c) => [c.id, c])), [categoriesQuery.data])

  // ---- chart ----
  // One set of buckets for both charts: the Month tab uses every day, Week Mon…Sun, Year months, Day 3-hour blocks.
  const chartBuckets = useMemo(() => getChartBuckets(period, range), [period, range])
  const lineValues = useMemo(() => bucketTotals(chartBuckets, expenses), [chartBuckets, expenses])
  const lineLabels = chartBuckets.map((b) => b.label)
  const chartProgress = getBucketProgress(chartBuckets, now)
  const lineElapsedCount = chartProgress.elapsedCount
  const subtitle = getPeriodSubtitle(period, range, now)

  // ---- totals ----
  const totalCents = sumCents(expenses)
  const comparison = compareTotals({
    currentCents: totalCents,
    previousCents: sumCents(previousQuery.data ?? []),
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
    () => buildStackedBars(period, chartBuckets, expenses, categoryTotals.map((t) => t.category), new Map(categoryTotals.map((t) => [t.category.id, t.tone]))),
    [period, chartBuckets, expenses, categoryTotals],
  )

  // ---- custom range picker ----
  const [pickerOpen, setPickerOpen] = useState(false)
  // Tab to go back to if the picker is cancelled before any custom range was ever chosen.
  const periodBeforeRange = useRef<PeriodKey>(period === 'range' ? 'week' : period)

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
    firstName: getFirstName(user?.name),
    currency,
    // period
    period,
    changePeriod: (next: PeriodKey) => (next === 'range' ? openPicker() : setPeriod(next)),
    subtitle,
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
    isLoading: currentQuery.isPending || categoriesQuery.isPending,
    isError: currentQuery.isError || categoriesQuery.isError,
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
