import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useCreatePastRecordMutation, useUpdatePastRecordMutation } from '@/queries/past-records/past-records-mutations'
import {
  emptyPastRecordValues,
  getFormPeriod,
  pastRecordFormToInput,
  pastRecordSchema,
  pastRecordToFormValues,
  type PastRecordFormValues,
} from '@/schemas/pastRecord/pastRecordSchema'
import type { PastRecord } from '@/types/pastRecord'
import { overlapsTracking } from '@/utils/pastSpending'

type Options = {
  record?: PastRecord
  currency: string
  firstTrackedAt: Date | null
  onSaved: () => void
}

export const usePastRecordForm = ({ record, currency, firstTrackedAt, onSaved }: Options) => {
  const [now] = useState(() => new Date())
  const form = useForm<PastRecordFormValues>({
    resolver: zodResolver(pastRecordSchema),
    defaultValues: record ? pastRecordToFormValues(record, currency, now) : emptyPastRecordValues(now),
  })
  const create = useCreatePastRecordMutation()
  const update = useUpdatePastRecordMutation()

  const onSubmit = form.handleSubmit((values) => {
    const input = pastRecordFormToInput(values, currency)
    if (record) update.mutate({ id: record.id, input }, { onSuccess: onSaved })
    else create.mutate(input, { onSuccess: onSaved })
  })

  // live overlap warning (CLAUDE.md §7.5: allowed, but warned)
  const [periodType, month, year, rangeStart, rangeEnd, amount] = useWatch({
    control: form.control,
    name: ['periodType', 'month', 'year', 'rangeStart', 'rangeEnd', 'amount'],
  })
  const period = getFormPeriod({ periodType, month, year, rangeStart, rangeEnd })
  const overlaps = !!period && overlapsTracking(period.end, firstTrackedAt)

  return { form, onSubmit, isSaving: create.isPending || update.isPending, overlaps, amountText: amount ?? '', now }
}
