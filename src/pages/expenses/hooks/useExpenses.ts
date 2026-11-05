import { useMemo, useState } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import { useGetCategoriesQuery } from '@/queries/categories/categories-queries'
import { useGetExpenseQuery, useGetExpensesQuery } from '@/queries/expenses/expenses-queries'
import { useGetProfileQuery } from '@/queries/profile/profile-queries'
import { useLocation, useNavigate, useParams } from '@/router/navigation'
import { filterExpenses, groupByDay, sumCents } from '@/utils/aggregate'
import { DEFAULT_CURRENCY } from '@/utils/money'
import { getPeriodRange, getPeriodSubtitle, isInRange, shiftAnchor } from '@/utils/period'
import { getMode, getPeriodHeading, type ListPeriod } from '../helpers/ExpensesHelpers'
import { useExpenseDeleteUndo } from './useExpenseDeleteUndo'

/** Everything the expenses page needs: the period's expenses, filters, and which screen the URL asks for. */
export const useExpenses = () => {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { expenseId } = useParams({ strict: false }) as { expenseId?: string }
  const mode = getMode(pathname, expenseId)

  // ---- period + filters (local to this page) ----
  const [now] = useState(() => new Date())
  const [period, setPeriod] = useState<ListPeriod>('week')
  const [anchor, setAnchor] = useState(now)
  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState('all')

  const range = useMemo(() => getPeriodRange(period, anchor), [period, anchor])
  const isCurrent = isInRange(now, range)

  // ---- data ----
  const expensesQuery = useGetExpensesQuery(range)
  const categoriesQuery = useGetCategoriesQuery()
  const profileQuery = useGetProfileQuery()
  const editedQuery = useGetExpenseQuery(mode.kind === 'edit' ? mode.id : undefined)
  const undo = useExpenseDeleteUndo()

  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data])
  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])
  const currency = profileQuery.data?.currency ?? DEFAULT_CURRENCY

  const inPeriod = useMemo(
    () => (expensesQuery.data ?? []).filter((e) => !undo.pendingIds.has(e.id)),
    [expensesQuery.data, undo.pendingIds],
  )
  const expenses = useMemo(() => filterExpenses(inPeriod, { query, categoryId }), [inPeriod, query, categoryId])

  const dayGroups = useMemo(() => groupByDay(expenses), [expenses])

  const subtitle = getPeriodSubtitle(period, range, now)
  const hasFilters = query.trim() !== '' || categoryId !== 'all'

  return {
    isMobile,
    mode,
    now,
    // period
    period,
    setPeriod,
    periodLabel: subtitle,
    periodHeading: getPeriodHeading(period, isCurrent, subtitle),
    isCurrentPeriod: isCurrent,
    goPrevious: () => setAnchor((a) => shiftAnchor(period, a, -1)),
    goNext: () => setAnchor((a) => shiftAnchor(period, a, 1)),
    // filters
    query,
    setQuery,
    categoryId,
    setCategoryId,
    hasFilters,
    clearFilters: () => {
      setQuery('')
      setCategoryId('all')
    },
    // data
    categories,
    categoryById,
    currency,
    expenses,
    dayGroups,
    totalInPeriodCount: inPeriod.length,
    totalCents: sumCents(expenses),
    isLoading: expensesQuery.isPending || categoriesQuery.isPending,
    isError: expensesQuery.isError || categoriesQuery.isError,
    retry: () => {
      void expensesQuery.refetch()
      void categoriesQuery.refetch()
    },
    requestDelete: undo.requestDelete,
    // editor
    editedExpense: editedQuery.data ?? undefined,
    isEditorLoading: mode.kind === 'edit' && (editedQuery.isPending || categoriesQuery.isPending),
    editorNotFound: mode.kind === 'edit' && editedQuery.isSuccess && !editedQuery.data,
    closeEditor: () => void navigate({ to: '/expenses' }),
  }
}

export type ExpensesCtx = ReturnType<typeof useExpenses>
