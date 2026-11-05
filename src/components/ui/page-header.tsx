import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type PageHeaderProps = {
  /** Small line above the title, e.g. "Hi Sam 👋". */
  eyebrow?: ReactNode
  title: ReactNode
  /** Line below the title, e.g. "This week · 9 entries · $194.50". */
  description?: ReactNode
  /** Right side: buttons, tabs, pickers. */
  actions?: ReactNode
  className?: string
}

/** Page title block used at the top of every app page. */
export const PageHeader = ({ eyebrow, title, description, actions, className }: PageHeaderProps) => (
  <header className={cn('flex flex-wrap items-end justify-between gap-4', className)}>
    <div className="flex min-w-0 flex-col">
      {eyebrow && <p className="text-base text-muted-foreground">{eyebrow}</p>}
      <h1 className="text-4xl font-extrabold tracking-tight text-ink lg:text-5xl">{title}</h1>
      {description && <p className="text-base text-muted-foreground">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
  </header>
)
