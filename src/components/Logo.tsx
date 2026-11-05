import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { APP_NAME } from '@/routes/app.routes'

const markVariants = cva('grid shrink-0 place-items-center font-extrabold', {
  variants: {
    tone: {
      primary: 'bg-primary text-primary-foreground',
      inverse: 'bg-card text-primary', // on a purple background (auth panel)
    },
    size: {
      md: 'size-9 rounded-control text-xl', // sidebar
      lg: 'size-9.5 rounded-control text-xl', // auth panel
    },
  },
  defaultVariants: { tone: 'primary', size: 'md' },
})

export type LogoProps = VariantProps<typeof markVariants> & { className?: string }

/** Brand mark ("$" square) + app name. */
const Logo = ({ tone, size, className }: LogoProps) => (
  <div className={cn('flex items-center gap-2.5', className)}>
    <span className={markVariants({ tone, size })} aria-hidden>
      $
    </span>
    <span className={cn('text-2xl font-extrabold tracking-tight', tone === 'inverse' ? 'text-primary-foreground' : 'text-ink')}>
      {APP_NAME}
    </span>
  </div>
)

export default Logo
