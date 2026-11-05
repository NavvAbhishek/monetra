import { cn } from '@/lib/utils'
import { CATEGORY_COLOURS } from '@/constant/categoryColours'
import { COLOUR_TOKENS, RADIUS_TOKENS, TYPE_TOKENS } from '../helpers/DevUiHelpers'
import Section, { Row } from './Section'

const Swatch = ({ name, className }: { name: string; className: string }) => (
  <div className="flex w-24 flex-col gap-1.5">
    <div className={cn('h-12 rounded-control border border-line', className)} />
    <span className="text-2xs text-muted-foreground">{name}</span>
  </div>
)

const FoundationsSection = () => (
  <Section title="Foundations" description="Tokens from src/index.css — change a value there and everything below updates.">
    <Row label="Colours">
      {COLOUR_TOKENS.map((t) => (
        <Swatch key={t.name} {...t} />
      ))}
    </Row>
    <Row label="Category colours (soft / strong)">
      {CATEGORY_COLOURS.map((c, i) => (
        <div key={c.softBg} className="flex w-24 flex-col gap-1.5">
          <div className={cn('grid h-12 place-items-center rounded-control text-xl font-bold', c.softBg, c.strongText)}>
            {i}
          </div>
          <span className="text-2xs text-muted-foreground">cat-{i}</span>
        </div>
      ))}
    </Row>
    <Row label="Type scale">
      <div className="flex w-full flex-col gap-1">
        {TYPE_TOKENS.map((t) => (
          <div key={t.name} className="flex items-baseline gap-4">
            <span className="w-28 shrink-0 text-2xs text-muted-foreground">{t.name}</span>
            <span className={cn('truncate text-ink', t.className)}>You spent $194.50</span>
          </div>
        ))}
      </div>
    </Row>
    <Row label="Radii">
      {RADIUS_TOKENS.map((t) => (
        <div key={t.name} className="flex flex-col items-center gap-1.5">
          <div className={cn('size-16 bg-primary-soft', t.className)} />
          <span className="text-2xs text-muted-foreground">{t.name}</span>
        </div>
      ))}
    </Row>
    <Row label="Shadows">
      {['shadow-fab', 'shadow-panel', 'shadow-pop', 'shadow-modal', 'shadow-side'].map((s) => (
        <div key={s} className="flex flex-col items-center gap-2">
          <div className={cn('size-16 rounded-panel bg-card', s)} />
          <span className="text-2xs text-muted-foreground">{s}</span>
        </div>
      ))}
    </Row>
  </Section>
)

export default FoundationsSection
