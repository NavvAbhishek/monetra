import { useMemo, useState } from 'react'
import { useGetCategoriesQuery } from '@/queries/categories/categories-queries'
import { useGetExpenseTotalsQuery } from '@/queries/expenses/expenses-queries'
import { useGetPastRecordsQuery } from '@/queries/past-records/past-records-queries'
import { useGetProfileQuery } from '@/queries/profile/profile-queries'
import type { PastRecord } from '@/types/pastRecord'
import { DEFAULT_CURRENCY } from '@/utils/money'
import { buildAllTime } from '@/utils/pastSpending'
import type { DialogState } from '../helpers/PastSpendingHelpers'

/** Past records + the all-time view (CLAUDE.md §7.5). Nothing here touches the dashboard. */
export const usePastSpending = () => {
  const recordsQuery = useGetPastRecordsQuery()
  const totalsQuery = useGetExpenseTotalsQuery()
  const categoriesQuery = useGetCategoriesQuery()
  const profileQuery = useGetProfileQuery()

  const records = useMemo(() => recordsQuery.data ?? [], [recordsQuery.data])
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data])
  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])
  const allTime = useMemo(() => buildAllTime(records, totalsQuery.data, categories), [records, totalsQuery.data, categories])

  const [dialog, setDialog] = useState<DialogState>({ kind: 'closed' })
  const [importOpen, setImportOpen] = useState(false)
  const [toDelete, setToDelete] = useState<PastRecord | null>(null)

  return {
    records,
    categories,
    categoryById,
    currency: profileQuery.data?.currency ?? DEFAULT_CURRENCY,
    allTime,
    firstTrackedAt: totalsQuery.data?.firstSpentAt ?? null,
    isLoading: recordsQuery.isPending || totalsQuery.isPending || categoriesQuery.isPending,
    isError: recordsQuery.isError || totalsQuery.isError || categoriesQuery.isError,
    error: recordsQuery.error ?? totalsQuery.error ?? categoriesQuery.error,
    retry: () => {
      void recordsQuery.refetch()
      void totalsQuery.refetch()
      void categoriesQuery.refetch()
    },
    // add / edit dialog
    dialog,
    openNew: () => setDialog({ kind: 'new' }),
    openEdit: (record: PastRecord) => setDialog({ kind: 'edit', record }),
    closeDialog: () => setDialog({ kind: 'closed' }),
    // CSV import
    importOpen,
    openImport: () => setImportOpen(true),
    closeImport: () => setImportOpen(false),
    // delete confirm
    toDelete,
    askDelete: setToDelete,
    closeDelete: () => setToDelete(null),
  }
}

export type PastSpendingCtx = ReturnType<typeof usePastSpending>
