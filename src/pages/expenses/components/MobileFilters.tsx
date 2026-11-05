import * as Icon from '@/components/icons'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { toneBg } from '@/components/ui/tone'
import type { ExpensesCtx } from '../hooks/useExpenses'
import { PeriodStepper, PeriodTabs } from './PeriodNav'

const chip = 'inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-control px-3 text-sm font-semibold whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring'

/** Mobile filters (M2): optional search, category chips, period controls. */
const MobileFilters = ({ ctx, searchOpen }: { ctx: ExpensesCtx; searchOpen: boolean }) => (
  <div className="flex flex-col gap-3">
    {searchOpen && (
      <Input
        size="md"
        type="search"
        aria-label="Search notes"
        placeholder="Search notes"
        startIcon={<Icon.Search />}
        value={ctx.query}
        onChange={(e) => ctx.setQuery(e.target.value)}
        autoFocus
      />
    )}

    <div role="group" aria-label="Filter by category" className="scrollbar-none -mx-5.5 flex gap-2 overflow-x-auto px-5.5 pb-0.5">
      <button
        type="button"
        aria-pressed={ctx.categoryId === 'all'}
        onClick={() => ctx.setCategoryId('all')}
        className={cn(chip, ctx.categoryId === 'all' ? 'bg-ink text-primary-foreground' : 'bg-card text-ink')}
      >
        All
      </button>
      {ctx.categories.map((c) => (
        <button
          key={c.id}
          type="button"
          aria-pressed={ctx.categoryId === c.id}
          onClick={() => ctx.setCategoryId(c.id)}
          className={cn(chip, toneBg(c.colourIndex), ctx.categoryId === c.id && 'ring-2 ring-ink')}
        >
          <span aria-hidden>{c.emoji}</span>
          {c.name}
        </button>
      ))}
    </div>

    <div className="flex flex-wrap items-center justify-between gap-2">
      <PeriodStepper ctx={ctx} />
      <PeriodTabs ctx={ctx} />
    </div>
  </div>
)

export default MobileFilters
