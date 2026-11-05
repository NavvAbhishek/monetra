import type { ReactNode } from 'react'

type PagePlaceholderProps = {
  title: string
  /** Design screen ids, e.g. "M1 · D1". */
  screens?: string
  /** Phase that builds the real screen (CLAUDE.md §8). */
  phase: number
  children?: ReactNode
}

/** TEMPORARY — stands in for a page until its phase is built. Delete when no longer used. */
const PagePlaceholder = ({ title, screens, phase, children }: PagePlaceholderProps) => (
  <section className="flex flex-col gap-3 rounded-panel border border-line bg-card p-6">
    <p className="text-2xs font-semibold tracking-wide text-muted-foreground uppercase">
      Placeholder · built in Phase {phase}
    </p>
    <h1 className="text-4xl font-extrabold text-ink">{title}</h1>
    {screens && <p className="text-sm text-muted-foreground">Design screens: {screens}</p>}
    {children && <div className="flex flex-wrap gap-3 pt-2">{children}</div>}
  </section>
)

export default PagePlaceholder
