import { cva } from 'class-variance-authority'

/**
 * Shared "field box" look for Input, PasswordInput, Textarea and Select trigger.
 * outline = auth forms (white + border); filled = toolbar / modal (white, no border).
 * Both show the primary border on focus and the danger border when invalid.
 */
export const fieldVariants = cva(
  'flex w-full items-center gap-2.5 border-2 bg-card text-ink transition-colors focus-within:border-primary has-[[aria-invalid=true]]:border-danger has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50',
  {
    variants: {
      variant: {
        outline: 'border-line',
        filled: 'border-transparent',
      },
      size: {
        md: 'h-11 rounded-icon px-3.5 text-base',
        lg: 'h-13 rounded-panel px-3.5 text-md',
      },
    },
    defaultVariants: { variant: 'outline', size: 'lg' },
  },
)

/** The bare <input>/<textarea> inside the field box. */
export const fieldControlClass =
  'h-full min-w-0 flex-1 bg-transparent font-medium outline-none placeholder:font-normal placeholder:text-muted-2 disabled:cursor-not-allowed'
