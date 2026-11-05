/** id for a FormField's error / hint text — pass it to the control's aria-describedby. */
export const fieldMessageId = (id: string) => `${id}-message`

/** a11y props for a control with a FormField: marks it invalid and links the error text. */
export const fieldErrorProps = (id: string, error?: string) =>
  error ? ({ 'aria-invalid': true, 'aria-describedby': fieldMessageId(id) } as const) : ({} as const)
