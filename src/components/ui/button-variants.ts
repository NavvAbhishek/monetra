import { cva } from 'class-variance-authority'

/**
 * The ONLY button style definition in the app (CLAUDE.md §6.1).
 * New look → add a variant here, never a one-off className in a page.
 *
 * Sizes from the design: sm 36px (toolbar), md 46px (header "+ Add expense"),
 * lg 50px (modal / panel actions), xl 56px (auth & mobile primary actions).
 */
export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 font-semibold whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        secondary: 'bg-primary-soft text-primary hover:bg-bar',
        surface: 'bg-card text-ink hover:bg-muted',
        outline: 'border-2 border-line bg-card text-ink hover:bg-muted',
        ghost: 'text-ink hover:bg-muted',
        danger: 'bg-danger text-danger-foreground hover:opacity-90',
        'danger-soft': 'bg-danger-soft text-danger hover:bg-danger hover:text-danger-foreground',
        'danger-ghost': 'text-danger hover:bg-danger-soft',
        link: 'text-primary underline-offset-4 hover:text-primary-hover hover:underline',
      },
      size: {
        sm: 'h-9 gap-1.5 rounded-control px-3 text-sm [&_svg]:size-4',
        md: 'h-11.5 rounded-icon px-5 text-md font-bold [&_svg]:size-4.5',
        lg: 'h-12.5 rounded-panel px-6 text-md font-bold [&_svg]:size-4.5',
        xl: 'h-14 rounded-fab px-6 text-lg font-bold [&_svg]:size-5',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    compoundVariants: [{ variant: 'link', class: 'h-auto px-0' }],
    defaultVariants: { variant: 'primary', size: 'md', fullWidth: false },
  },
)
