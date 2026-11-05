import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { EmojiBox } from './emoji-box'

export type EmptyStateProps = {
  /** Emoji shown in a soft square. */
  emoji?: string
  title: ReactNode
  description?: ReactNode
  /** Usually a <Button>. */
  action?: ReactNode
  className?: string
}

/** "Nothing here yet" block for empty lists and no search results. */
export const EmptyState = ({ emoji = '🧾', title, description, action, className }: EmptyStateProps) => (
  <div
    data-slot="empty-state"
    className={cn(
      'flex flex-col items-center gap-2 rounded-table border-2 border-dashed border-line px-6 py-10 text-center',
      className,
    )}
  >
    <EmojiBox emoji={emoji} size="lg" tone="card" />
    <h3 className="pt-1 text-xl font-bold text-ink">{title}</h3>
    {description && <p className="max-w-xs text-sm text-muted-foreground">{description}</p>}
    {action && <div className="pt-2">{action}</div>}
  </div>
)
