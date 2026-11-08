import { format } from 'date-fns'
import { Controller } from 'react-hook-form'
import DatePicker from '@/components/DatePicker'
import { AmountInput } from '@/components/ExpenseForm/components/AmountInput'
import * as Icon from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { FormField } from '@/components/ui/form-field'
import { fieldErrorProps, fieldMessageId } from '@/components/ui/form-field-ids'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SegmentedTabs } from '@/components/ui/segmented-tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MAX_NOTE_LENGTH } from '@/constant/defaultCategories'
import type { Category } from '@/types/category'
import type { PastRecord } from '@/types/pastRecord'
import { getCurrencySymbol } from '@/utils/money'
import { getYearOptions, MONTH_OPTIONS, PERIOD_TYPE_OPTIONS } from '../../helpers/PastSpendingHelpers'
import { usePastRecordForm } from './hooks/usePastRecordForm'

const FORM_ID = 'past-record-form'

type PastRecordDialogProps = {
  /** Record to edit, or undefined to add a new one. */
  record?: PastRecord
  categories: readonly Category[]
  currency: string
  firstTrackedAt: Date | null
  onClose: () => void
  onDelete: (record: PastRecord) => void
}

/** Add / edit one past-spending total: amount, period (month / year / range), category, note. */
const PastRecordDialog = ({ record, categories, currency, firstTrackedAt, onClose, onDelete }: PastRecordDialogProps) => {
  const { form, onSubmit, isSaving, overlaps, amountText, now } = usePastRecordForm({ record, currency, firstTrackedAt, onSaved: onClose })
  const { register, control, formState, watch } = form
  const { errors } = formState
  const periodType = watch('periodType')
  const years = getYearOptions(now)
  const todayIso = format(now, 'yyyy-MM-dd')

  const yearSelect = (
    <Controller
      control={control}
      name="year"
      render={({ field }) => (
        <Select value={field.value} onValueChange={field.onChange}>
          <SelectTrigger id="past-year" variant="filled" size="md" {...fieldErrorProps('past-year', errors.year?.message)}>
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  )

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        size="md"
        onOpenAutoFocus={(e) => {
          const amount = document.getElementById('past-amount')
          if (amount) {
            e.preventDefault()
            amount.focus()
          }
        }}
      >
        <DialogHeader
          title={record ? 'Edit past spending' : 'Add past spending'}
          description="Money you spent before Monetra."
        />

        <form id={FORM_ID} onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          {/* amount */}
          <div className="flex flex-col gap-1 rounded-table bg-card px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="past-amount" variant="muted" className="text-base">
                Amount
              </Label>
              <AmountInput
                id="past-amount"
                symbol={getCurrencySymbol(currency)}
                size="dialog"
                text={amountText}
                invalid={!!errors.amount}
                aria-describedby={errors.amount ? fieldMessageId('past-amount') : undefined}
                {...register('amount')}
              />
            </div>
            {errors.amount?.message && (
              <p id={fieldMessageId('past-amount')} role="alert" className="text-right text-xs font-semibold text-danger">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* period */}
          <div className="flex flex-col gap-2">
            <Label variant="strong" className="text-base">
              Period
            </Label>
            <Controller
              control={control}
              name="periodType"
              render={({ field }) => (
                <SegmentedTabs variant="track" aria-label="Period type" value={field.value} onValueChange={field.onChange} options={PERIOD_TYPE_OPTIONS} />
              )}
            />
            {periodType === 'month' && (
              <div className="grid grid-cols-2 gap-2.5">
                <FormField id="past-month" label="Month" labelVariant="muted" error={errors.month?.message}>
                  <Controller
                    control={control}
                    name="month"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="past-month" variant="filled" size="md">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTH_OPTIONS.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>
                <FormField id="past-year" label="Year" labelVariant="muted" error={errors.year?.message}>
                  {yearSelect}
                </FormField>
              </div>
            )}
            {periodType === 'year' && (
              <FormField id="past-year" label="Year" labelVariant="muted" error={errors.year?.message}>
                {yearSelect}
              </FormField>
            )}
            {periodType === 'range' && (
              <div className="grid grid-cols-2 gap-2.5">
                <FormField id="past-from" label="From" labelVariant="muted" error={errors.rangeStart?.message}>
                  <Controller
                    control={control}
                    name="rangeStart"
                    render={({ field }) => (
                      <DatePicker id="past-from" variant="filled" size="md" max={todayIso} value={field.value} onChange={field.onChange} invalid={!!errors.rangeStart} />
                    )}
                  />
                </FormField>
                <FormField id="past-to" label="To" labelVariant="muted" error={errors.rangeEnd?.message}>
                  <Controller
                    control={control}
                    name="rangeEnd"
                    render={({ field }) => (
                      <DatePicker id="past-to" variant="filled" size="md" max={todayIso} value={field.value} onChange={field.onChange} invalid={!!errors.rangeEnd} />
                    )}
                  />
                </FormField>
              </div>
            )}
          </div>

          {/* category + note */}
          <div className="grid gap-2.5 sm:grid-cols-2">
            <FormField id="past-category" label="Category" labelVariant="muted" hint="Optional — keep “All categories” for a total.">
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="past-category" variant="filled" size="md">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.emoji} {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField id="past-note" label="Note" labelVariant="muted" error={errors.note?.message}>
              <Input
                id="past-note"
                variant="filled"
                size="md"
                maxLength={MAX_NOTE_LENGTH + 20}
                placeholder="e.g. From my old app"
                {...fieldErrorProps('past-note', errors.note?.message)}
                {...register('note')}
              />
            </FormField>
          </div>

          {overlaps && (
            <p role="status" className="flex gap-2 rounded-panel bg-cat-3-soft px-3.5 py-3 text-sm text-cat-3-strong">
              <Icon.TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              This period overlaps with expenses you’ve tracked in Monetra
              {firstTrackedAt ? ` (since ${format(firstTrackedAt, 'MMM d, yyyy')})` : ''}. You can still save it, but the all-time total may count some spending twice.
            </p>
          )}
        </form>

        <DialogFooter>
          {record && (
            <Button variant="danger-ghost" size="lg" className="px-1.5" onClick={() => onDelete(record)}>
              Delete
            </Button>
          )}
          <span className="flex-1" />
          <DialogClose asChild>
            <Button variant="surface" size="lg">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" form={FORM_ID} size="lg" loading={isSaving}>
            {record ? 'Save changes' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PastRecordDialog
