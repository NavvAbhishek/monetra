import { useEffect, useRef, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useWatch } from 'react-hook-form'
import { AmountInput } from '@/components/ExpenseForm/components/AmountInput'
import * as Icon from '@/components/icons'
import { Amount } from '@/components/ui/amount'
import { Button } from '@/components/ui/button'
import { fieldMessageId } from '@/components/ui/form-field-ids'
import { Label } from '@/components/ui/label'
import type { ExpenseFormValues } from '@/schemas/expense/expenseSchema'
import { splitAmountParts, sumAmountExpression } from '@/utils/amountExpression'
import { formatMoney, getCurrencySymbol, toCents } from '@/utils/money'

export type AmountEntryProps = {
  form: UseFormReturn<ExpenseFormValues>
  currency: string
  /** dialog = desktop modal · screen = mobile full screen */
  size: 'dialog' | 'screen'
}

/**
 * Amount with chips (user's choice, 2026-11-06): type an amount, press Add (or Enter) — it becomes a chip
 * and the box clears for the next one (500, 100, 600 → saved ONCE as 1,200).
 * Chips stay in a SINGLE row that scrolls sideways (swipe, trackpad, or the mouse wheel + a thin scrollbar on desktop). The form's `amount` always holds
 * "chip+chip+…+whatever is in the box", so nothing typed is lost on Save.
 */
const AmountEntry = ({ form, currency, size }: AmountEntryProps) => {
  const { setValue, formState, control } = form
  const error = formState.errors.amount?.message
  const formText = useWatch({ control, name: 'amount' }) ?? ''

  // start from whatever the form holds (e.g. an expense being edited)
  const [committed, setCommitted] = useState(() => splitAmountParts(formText).slice(0, -1))
  const [draft, setDraft] = useState(() => splitAmountParts(formText).slice(-1)[0] ?? '')

  const sync = (nextCommitted: string[], nextDraft: string) => {
    setCommitted(nextCommitted)
    setDraft(nextDraft)
    setValue('amount', [...nextCommitted, nextDraft.trim()].filter(Boolean).join('+'), {
      shouldDirty: true,
      shouldValidate: formState.isSubmitted,
    })
  }

  const draftValid = (toCents(draft, currency) ?? 0) > 0
  const add = () => draftValid && sync([...committed, draft.trim()], '')
  const total = sumAmountExpression([...committed, draft].join('+'), currency)

  // keep the newest chip in view
  const scroller = useRef<HTMLDivElement>(null)
  useEffect(() => {
    scroller.current?.scrollTo({ left: scroller.current.scrollWidth, behavior: 'smooth' })
  }, [committed.length])

  // A mouse wheel only scrolls up / down, so turn it into sideways scrolling over the chips (touch and trackpads
  // already scroll sideways). At either end the page scrolls as usual. Needs a non-passive listener — React's onWheel is passive.
  useEffect(() => {
    const el = scroller.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
      const atStart = el.scrollLeft <= 0 && e.deltaY < 0
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 && e.deltaY > 0
      if (atStart || atEnd) return
      e.preventDefault()
      el.scrollLeft += e.deltaY
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor="expense-amount" variant="muted" className="text-base">
          {size === 'screen' ? 'How much?' : 'Amount'}
        </Label>
        <AmountInput
          id="expense-amount"
          symbol={getCurrencySymbol(currency)}
          size={size}
          text={draft}
          value={draft}
          invalid={!!error}
          aria-describedby={error ? fieldMessageId('expense-amount') : undefined}
          onChange={(e) => sync(committed, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault() // Enter adds a chip, it does not save the expense
              add()
            }
          }}
        />
      </div>
      {error && (
        <p id={fieldMessageId('expense-amount')} role="alert" className="text-right text-xs font-semibold text-danger">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <div ref={scroller} role="list" aria-label="Amounts added" className="scrollbar-thin-mouse flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-1">
          {committed.map((part, i) => {
            const label = formatMoney(toCents(part, currency) ?? 0, currency)
            return (
              <span
                key={`${part}-${i}`}
                role="listitem"
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-soft py-1 pr-1 pl-3 text-base font-semibold whitespace-nowrap text-primary-hover"
              >
                {label}
                <button
                  type="button"
                  aria-label={`Remove ${label}`}
                  onClick={() => sync(committed.filter((_, j) => j !== i), draft)}
                  className="grid size-6 cursor-pointer place-items-center rounded-full outline-none hover:bg-card focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon.X className="size-3.5" aria-hidden />
                </button>
              </span>
            )
          })}
        </div>
        <Button variant="secondary" size="sm" className="shrink-0" disabled={!draftValid} onClick={add}>
          <Icon.Plus aria-hidden />
          Add
        </Button>
      </div>

      {committed.length > 0 && total !== null && (
        <p className="flex items-baseline justify-end gap-2 text-base text-muted-foreground" role="status" aria-live="polite">
          Total <Amount cents={total} currency={currency} size="md" />
        </p>
      )}
    </div>
  )
}

export default AmountEntry
