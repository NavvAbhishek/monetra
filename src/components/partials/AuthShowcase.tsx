import EmojiCollage from '@/components/partials/EmojiCollage'
import Logo from '@/components/Logo'
import { Amount } from '@/components/ui/amount'
import { Tile } from '@/components/ui/tile'
import { cn } from '@/lib/utils'

export type AuthShowcaseVariant = 'tiles' | 'summary'

const TAGLINES: Record<AuthShowcaseVariant, string> = {
  tiles: 'Every expense, sorted by what it was for.',
  summary: 'Daily, weekly and monthly totals in one place.',
}

/** Sample numbers for the sign-up preview card (D6). */
const SUMMARY = [
  { emoji: '🍔', tone: 0, label: 'Food · $43.00' },
  { emoji: '🛒', tone: 1, label: 'Groceries · $67.90' },
] as const

/** Purple left panel of the desktop auth screens (D5 / D6). */
const AuthShowcase = ({ variant, className }: { variant: AuthShowcaseVariant; className?: string }) => {
  return (
    <aside className={cn('relative w-140 shrink-0 flex-col overflow-hidden bg-primary px-12 py-10 text-primary-foreground', className)}>
      <Logo tone="inverse" size="lg" />

      {variant === 'tiles' ? (
        <EmojiCollage size="large" className="mt-15 h-80" />
      ) : (
        <div className="mt-17.5 flex -rotate-2 flex-col gap-3 rounded-card bg-card p-5.5 text-ink">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>You spent</span>
            <span>This week</span>
          </div>
          <Amount cents={19450} size="hero" />
          <div className="grid grid-cols-2 gap-2">
            {SUMMARY.map((s) => (
              <Tile key={s.emoji} tone={s.tone} size="md" className="flex-row items-center gap-2 rounded-panel px-3 py-2.5 text-sm font-semibold">
                <span className="text-emoji-md" aria-hidden>
                  {s.emoji}
                </span>
                {s.label}
              </Tile>
            ))}
          </div>
        </div>
      )}

      <p className="mt-auto text-hero font-extrabold tracking-tight text-balance">{TAGLINES[variant]}</p>
    </aside>
  )
}

export default AuthShowcase
