import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { fieldMessageId } from './form-field-ids'
import { Label, type LabelProps } from './label'

export type FormFieldProps = {
  /** id of the control inside; connects the label and the message. */
  id: string
  label: ReactNode
  /** Shown on the right of the label (e.g. "Forgot password?"). */
  labelAction?: ReactNode
  labelVariant?: LabelProps['variant']
  hint?: ReactNode
  error?: string
  className?: string
  children: ReactNode
}

/** Label + control + hint / error. Use for every form control. */
export const FormField = ({
  id,
  label,
  labelAction,
  labelVariant,
  hint,
  error,
  className,
  children,
}: FormFieldProps) => (
  <div data-slot="form-field" className={cn('flex flex-col gap-1.5', className)}>
    <div className="flex items-center justify-between gap-2">
      <Label htmlFor={id} variant={labelVariant}>
        {label}
      </Label>
      {labelAction}
    </div>
    {children}
    {error ? (
      <p id={fieldMessageId(id)} role="alert" className="text-xs font-semibold text-danger">
        {error}
      </p>
    ) : hint ? (
      <p id={fieldMessageId(id)} className="text-xs text-muted-foreground">
        {hint}
      </p>
    ) : null}
  </div>
)
