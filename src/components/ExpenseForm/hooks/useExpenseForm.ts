import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useCreateExpenseMutation, useUpdateExpenseMutation } from '@/queries/expenses/expenses-mutations'
import { expenseFormToInput, expenseSchema, expenseToFormValues, type ExpenseFormValues } from '@/schemas/expense/expenseSchema'
import { useUIStore } from '@/stores/ui.store'
import type { Category } from '@/types/category'
import type { Expense } from '@/types/expense'

type Options = {
  /** The expense being edited, or undefined to add a new one. */
  expense?: Expense
  categories: readonly Category[]
  currency: string
  onSaved: () => void
}

export const useExpenseForm = ({ expense, categories, currency, onSaved }: Options) => {
  const lastCategoryId = useUIStore((s) => s.lastCategoryId)
  const setLastCategoryId = useUIStore((s) => s.setLastCategoryId)

  // New expense: today, and the category used last time (else the first one).
  const startCategoryId = categories.some((c) => c.id === lastCategoryId) ? (lastCategoryId as string) : (categories[0]?.id ?? '')
  const [today] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense
      ? expenseToFormValues(expense, currency)
      : { amount: '', categoryId: startCategoryId, date: today, time: '', note: '' },
  })

  const create = useCreateExpenseMutation()
  const update = useUpdateExpenseMutation()

  const onSubmit = form.handleSubmit((values) => {
    const input = expenseFormToInput(values, currency)
    const options = {
      onSuccess: () => {
        setLastCategoryId(input.categoryId)
        onSaved()
      },
    }
    if (expense) update.mutate({ id: expense.id, input }, options)
    else create.mutate(input, options)
  })

  return { form, onSubmit, isSaving: create.isPending || update.isPending }
}

export type ExpenseFormCtx = ReturnType<typeof useExpenseForm>
