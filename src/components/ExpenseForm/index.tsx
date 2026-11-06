import { Controller } from 'react-hook-form'
import DatePicker from '@/components/DatePicker'
import AmountEntry from '@/components/ExpenseForm/components/AmountEntry'
import CategoryPicker from '@/components/ExpenseForm/components/CategoryPicker'
import type { ExpenseFormCtx } from '@/components/ExpenseForm/hooks/useExpenseForm'
import { FormField } from '@/components/ui/form-field'
import { fieldErrorProps } from '@/components/ui/form-field-ids'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MAX_NOTE_LENGTH } from '@/constant/defaultCategories'
import type { Category } from '@/types/category'

/** Submit buttons live outside the form (modal footer / screen footer) and point here. */
export const EXPENSE_FORM_ID = 'expense-form'

export type ExpenseFormProps = {
  ctx: ExpenseFormCtx
  categories: readonly Category[]
  currency: string
  /** dialog = desktop modal (D3) · screen = mobile full screen (M3). */
  layout: 'dialog' | 'screen'
}

/**
 * Amount, category, date and note. Shared by the add and edit flows (CLAUDE.md §3).
 * There is no time field (user decision): a new expense gets the current time (today) or 12:00 (other days),
 * and editing keeps the expense's existing time — `time` stays in the form values but is never shown.
 */
const ExpenseForm = ({ ctx, categories, currency, layout }: ExpenseFormProps) => {
  const { form, onSubmit } = ctx
  const { register, control, formState } = form
  const { errors } = formState
  const isScreen = layout === 'screen'

  const amountBlock = (
      <div className="flex flex-col gap-1 rounded-table bg-card px-5 py-4">
        <AmountEntry form={form} currency={currency} size={isScreen ? 'screen' : 'dialog'} />

        {isScreen && (
          <div className="mt-2 flex flex-col gap-3 border-t border-line pt-3">
            <FormField id="expense-date" label="When" labelVariant="muted" error={errors.date?.message}>
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <DatePicker id="expense-date" size="md" value={field.value} onChange={field.onChange} invalid={!!errors.date} />
                )}
              />
            </FormField>
            <FormField id="expense-note" label="Note" labelVariant="muted" error={errors.note?.message}>
              <Input
                id="expense-note"
                size="md"
                maxLength={MAX_NOTE_LENGTH + 20}
                placeholder="What was it for?"
                {...fieldErrorProps('expense-note', errors.note?.message)}
                {...register('note')}
              />
            </FormField>
          </div>
        )}
      </div>
  )

  const categoryBlock = (
      <div className="flex flex-col gap-2">
        <Label variant="strong" htmlFor="expense-category" className={isScreen ? 'sr-only' : 'text-base'}>
          Category
        </Label>
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <CategoryPicker id="expense-category" categories={categories} value={field.value} onChange={field.onChange} layout={layout} />
          )}
        />
        {errors.categoryId?.message && (
          <p role="alert" className="text-xs font-semibold text-danger">
            {errors.categoryId.message}
          </p>
        )}
      </div>
  )

  return (
    <form id={EXPENSE_FORM_ID} onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {/* Screen (M3): category tiles first, then the amount card. Dialog (D3): amount first. */}
      {isScreen ? categoryBlock : amountBlock}
      {isScreen ? amountBlock : categoryBlock}

      {/* Date + note (dialog) */}
      {!isScreen && (
        <div className="grid grid-cols-2 gap-2.5">
          <FormField id="expense-date" label="Date" labelVariant="muted" error={errors.date?.message}>
            <Controller
              control={control}
              name="date"
              render={({ field }) => (
                <DatePicker id="expense-date" variant="filled" size="md" value={field.value} onChange={field.onChange} invalid={!!errors.date} />
              )}
            />
          </FormField>
          <FormField id="expense-note" label="Note" labelVariant="muted" error={errors.note?.message}>
            <Input
              id="expense-note"
              variant="filled"
              size="md"
              maxLength={MAX_NOTE_LENGTH + 20}
              placeholder="What was it for?"
              {...fieldErrorProps('expense-note', errors.note?.message)}
              {...register('note')}
            />
          </FormField>
        </div>
      )}
    </form>
  )
}

export default ExpenseForm
