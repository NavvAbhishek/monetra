import { format } from 'date-fns'
import { useMemo, useState } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import { useGetCategoriesQuery } from '@/queries/categories/categories-queries'
import { useGetExpensesQuery } from '@/queries/expenses/expenses-queries'
import { useGetProfileQuery } from '@/queries/profile/profile-queries'
import { useLocation, useNavigate, useParams } from '@/router/navigation'
import { totalsByCategory } from '@/utils/aggregate'
import { DEFAULT_CURRENCY } from '@/utils/money'
import { getPeriodRange } from '@/utils/period'
import { getMode, NO_STATS, type CategoryStats } from '../helpers/CategoriesHelpers'

/** Everything the categories page needs: data, this month's totals, and which screen the URL asks for. */
export const useCategories = () => {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { categoryId } = useParams({ strict: false }) as { categoryId?: string }
  const mode = getMode(pathname, categoryId)

  const categoriesQuery = useGetCategoriesQuery()
  const [monthRange] = useState(() => getPeriodRange('month', new Date())) // month is fixed for this visit
  const expensesQuery = useGetExpensesQuery(monthRange)
  const profileQuery = useGetProfileQuery()

  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data])
  const currency = profileQuery.data?.currency ?? DEFAULT_CURRENCY

  // this month's spending and entry count per category
  const statsById = useMemo(
    () => new Map(totalsByCategory(expensesQuery.data ?? []).map((t) => [t.categoryId, { cents: t.cents, count: t.count }])),
    [expensesQuery.data],
  )
  const statsFor = (id: string): CategoryStats => statsById.get(id) ?? NO_STATS

  const selected = mode.kind === 'edit' ? categories.find((c) => c.id === mode.id) : undefined

  return {
    isMobile,
    mode,
    categories,
    currency,
    monthName: format(monthRange.start, 'MMMM'),
    statsFor,
    selected,
    isLoading: categoriesQuery.isPending,
    isError: categoriesQuery.isError,
    retry: () => void categoriesQuery.refetch(),
    /** Editing a category that doesn't exist (bad link, or it was just deleted). */
    notFound: mode.kind === 'edit' && categoriesQuery.isSuccess && !selected,
    closeEditor: () => void navigate({ to: '/categories' }),
  }
}

export type CategoriesCtx = ReturnType<typeof useCategories>
