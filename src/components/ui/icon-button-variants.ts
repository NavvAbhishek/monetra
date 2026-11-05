import { cva } from 'class-variance-authority'

/** Square icon-only buttons: modal close, table row actions, mobile "+" (fab). */
export const iconButtonVariants = cva(
  'inline-grid shrink-0 place-items-center transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none',
  {
    variants: {
      variant: {
        surface: 'bg-card text-ink hover:bg-muted',
        muted: 'bg-bg text-ink hover:bg-muted',
        ghost: 'text-muted-foreground hover:bg-muted hover:text-ink',
        primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        'danger-soft': 'bg-danger-soft text-danger hover:bg-danger hover:text-danger-foreground',
      },
      size: {
        sm: 'size-8 rounded-chip [&_svg]:size-4',
        md: 'size-9.5 rounded-control [&_svg]:size-4.5',
        lg: 'size-10.5 rounded-icon [&_svg]:size-5',
        fab: 'size-13.5 rounded-fab shadow-fab [&_svg]:size-6',
      },
    },
    defaultVariants: { variant: 'surface', size: 'md' },
  },
)
