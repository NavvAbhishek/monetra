import * as Icon from '@/components/icons'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ExpensesCtx } from '../hooks/useExpenses'
import { PeriodStepper, PeriodTabs } from './PeriodNav'

/** Desktop filter bar (D2): search, category, period stepper, Week / Month / Year. */
const ExpensesToolbar = ({ ctx }: { ctx: ExpensesCtx }) => (
  <div className="flex flex-wrap items-center gap-2.5">
    <Input
      variant="filled"
      size="md"
      type="search"
      aria-label="Search notes"
      placeholder="Search notes"
      startIcon={<Icon.Search />}
      wrapperClassName="w-80"
      value={ctx.query}
      onChange={(e) => ctx.setQuery(e.target.value)}
    />
    <Select value={ctx.categoryId} onValueChange={ctx.setCategoryId}>
      <SelectTrigger variant="filled" size="md" className="w-52" aria-label="Category">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All categories</SelectItem>
        {ctx.categories.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.emoji} {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <div className="ml-auto flex items-center gap-3">
      <PeriodStepper ctx={ctx} />
      <PeriodTabs ctx={ctx} />
    </div>
  </div>
)

export default ExpensesToolbar
