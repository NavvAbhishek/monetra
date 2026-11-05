import { Controller } from 'react-hook-form'
import { AmountInput } from '@/components/ExpenseForm/components/AmountInput'
import CategoryPicker from '@/components/ExpenseForm/components/CategoryPicker'
import type { ExpenseFormCtx } from '@/components/ExpenseForm/hooks/useExpenseForm'
import { FormField } from '@/components/ui/form-field'
import { fieldErrorProps, fieldMessageId } from '@/components/ui/form-field-ids'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MAX_NOTE_LENGTH } from '@/constant/defaultCategories'
import type { Category } from '@/types/category'
import { getCurrencySymbol } from '@/utils/money'

/** Submit buttons live outside the form (modal footer / screen footer) and point here. */
export const EXPENSE_FORM_ID = 'expense-form'

export type ExpenseFormProps = {
  ctx: ExpenseFormCtx
  categories: readonly Category[]
  currency: string
  /** dialog = desktop modal (D3) · screen = mobile full screen (M3). */
  layout: 'dialog' | 'screen'
}

/** Amount, category, date, time and note. Shared by the add and edit flows (CLAUDE.md §3). */
const ExpenseForm = ({ ctx, categories, currency, layout }: ExpenseFormProps) => {
  const { form, onSubmit } = ctx
  const { register, control, formState } = form
  const { errors } = formState
  const isScreen = layout === 'screen'
  const amountError = errors.amount?.message

  const amountBlock = (
      <div className="flex flex-col gap-1 rounded-table bg-card px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="expense-amount" variant="muted" className="text-base">
            {isScreen ? 'How much?' : 'Amount'}
          </Label>
          <AmountInput
            id="expense-amount"
            symbol={getCurrencySymbol(currency)}
            size={isScreen ? 'screen' : 'dialog'}
            invalid={!!amountError}
            aria-describedby={amountError ? fieldMessageId('expense-amount') : undefined}
            {...register('amount')}
          />
        </div>
        {amountError && (
          <p id={fieldMessageId('expense-amount')} role="alert" className="text-right text-xs font-semibold text-danger">
            {amountError}
          </p>
        )}

        {isScreen && (
          <div className="mt-2 flex flex-col gap-3 border-t border-line pt-3">
            <FormField id="expense-date" label="When" labelVariant="muted" error={errors.date?.message}>
              <div className="flex gap-2">
                <Input id="expense-date" type="date" size="md" {...fieldErrorProps('expense-date', errors.date?.message)} {...register('date')} />
                <Input id="expense-time" type="time" size="md" aria-label="Time (optional)" wrapperClassName="w-32 shrink-0" {...register('time')} />
              </div>
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

      {/* Date, time, note (dialog) */}
      {!isScreen && (
        <div className="grid grid-cols-2 gap-2.5">
          <FormField id="expense-date" label="Date" labelVariant="muted" error={errors.date?.message}>
            <Input id="expense-date" type="date" variant="filled" size="md" {...fieldErrorProps('expense-date', errors.date?.message)} {...register('date')} />
          </FormField>
          <FormField id="expense-time" label="Time (optional)" labelVariant="muted" error={errors.time?.message}>
            <Input id="expense-time" type="time" variant="filled" size="md" {...fieldErrorProps('expense-time', errors.time?.message)} {...register('time')} />
          </FormField>
          <FormField id="expense-note" label="Note" labelVariant="muted" error={errors.note?.message} className="col-span-2">
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
