import { Amount } from '@/components/ui/amount'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { EmojiBox } from '@/components/ui/emoji-box'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tile } from '@/components/ui/tile'
import { toneText } from '@/components/ui/tone'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { SAMPLE_CATEGORIES } from '../helpers/DevUiHelpers'
import Section, { Row } from './Section'

const DisplaySection = () => (
  <Section title="Display" description="card · tile · emoji-box · badge · avatar · amount · progress · skeleton · separator · page-header · empty-state">
    <Row label="PageHeader">
      <div className="w-full rounded-panel bg-bg p-5">
        <PageHeader
          eyebrow="Hi Sam 👋"
          title="Your money"
          description="This week · 9 entries · $194.50"
          actions={<Button>+ Add expense</Button>}
        />
      </div>
    </Row>

    <Row label="Tile · md (dashboard)">
      <div className="grid w-full max-w-sm grid-cols-2 gap-2.5">
        {SAMPLE_CATEGORIES.slice(0, 4).map((c, i) => (
          <Tile key={c.name} tone={i}>
            <div className="flex items-center justify-between">
              <span className="text-emoji-lg" aria-hidden>
                {c.emoji}
              </span>
              <span className={cn('text-xs font-semibold', toneText(i))}>{c.pct}%</span>
            </div>
            <span className="pt-1 text-sm text-text-soft">{c.name}</span>
            <Amount cents={c.cents} size="md" />
          </Tile>
        ))}
      </div>
    </Row>

    <Row label="Tile · sm (category picker, selected + interactive)">
      <div className="grid w-full max-w-xl grid-cols-6 gap-2">
        {SAMPLE_CATEGORIES.map((c, i) => (
          <Tile key={c.name} tone={i} size="sm" interactive selected={i === 0} asChild>
            <button type="button" aria-pressed={i === 0}>
              <span className="text-emoji-lg" aria-hidden>
                {c.emoji}
              </span>
              <span className="text-xs font-semibold">{c.name}</span>
            </button>
          </Tile>
        ))}
      </div>
    </Row>

    <Row label="Tile · lg (categories grid) + dashed">
      <div className="grid w-full grid-cols-2 gap-3 md:grid-cols-4">
        {SAMPLE_CATEGORIES.slice(0, 3).map((c, i) => (
          <Tile key={c.name} tone={i} size="lg" selected={i === 1}>
            <div className="flex items-start justify-between">
              <span className="text-emoji-xl" aria-hidden>
                {c.emoji}
              </span>
              <span className="text-xs text-text-soft">12 entries</span>
            </div>
            <span className="mt-auto text-base text-text-soft">{c.name}</span>
            <Amount cents={c.cents} size="lg" />
          </Tile>
        ))}
        <Tile size="lg" dashed interactive asChild>
          <button type="button">
            <span className="text-4xl">+</span>
            New category
          </button>
        </Tile>
      </div>
    </Row>

    <Row label="EmojiBox · sm / md / lg / xl">
      {(['sm', 'md', 'lg', 'xl'] as const).map((size, i) => (
        <EmojiBox key={size} emoji={SAMPLE_CATEGORIES[i].emoji} tone={i} size={size} />
      ))}
      <EmojiBox emoji="🧾" tone="neutral" />
      <EmojiBox emoji="🧾" tone="card" className="border border-line" />
    </Row>

    <Row label="Badge (category tones + named)">
      {SAMPLE_CATEGORIES.map((c, i) => (
        <Badge key={c.name} tone={i}>
          {c.name}
        </Badge>
      ))}
      <Badge tone="primary">Primary</Badge>
      <Badge tone="success">12% less</Badge>
      <Badge tone="danger">6% more</Badge>
      <Badge tone="neutral">Neutral</Badge>
      <Badge tone="ink" size="sm">
        New
      </Badge>
    </Row>

    <Row label="Avatar">
      <Avatar name="Sam Perera" size="sm" />
      <Avatar name="Sam Perera" />
      <Avatar name="Ana" size="lg" tone={4} />
    </Row>

    <Row label="Amount">
      <Amount cents={2450} />
      <Amount cents={32640} size="md" />
      <Amount cents={32640} size="lg" />
      <Amount cents={19450} size="xl" />
      <Amount cents={19450} size="hero" />
      <Amount cents={155100} compact size="md" tone="muted" />
      <span className="rounded-control bg-primary px-3 py-1">
        <Amount cents={19450} size="md" tone="inverse" />
      </span>
    </Row>

    <Row label="Progress (category breakdown)">
      <div className="flex w-full max-w-md flex-col gap-3">
        {SAMPLE_CATEGORIES.slice(0, 3).map((c, i) => (
          <Progress key={c.name} value={(c.pct / 27) * 100} tone={i} label={`${c.name} ${c.pct}%`} />
        ))}
        <Progress value={64} label="Primary 64%" />
      </div>
    </Row>

    <Row label="Card + Skeleton">
      <Card className="w-full max-w-sm border border-line">
        <CardHeader>
          <CardTitle>Recent expenses</CardTitle>
          <Button variant="link" size="sm">
            See all
          </Button>
        </CardHeader>
        <div className="flex flex-col gap-3 pt-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-10.5 rounded-icon" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-4 w-14" />
            </div>
          ))}
        </div>
      </Card>
    </Row>

    <Row label="Separator">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <Separator />
        <Separator label="or" />
      </div>
    </Row>

    <Row label="EmptyState">
      <EmptyState
        className="w-full"
        title="No expenses yet"
        description="Add your first expense and it will show up here."
        action={<Button>+ Add expense</Button>}
      />
    </Row>
  </Section>
)

export default DisplaySection
