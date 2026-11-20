import * as Icon from '@/components/icons'
import { EmojiBox } from '@/components/ui/emoji-box'
import { Link } from '@/router/navigation'

/** Phones only: the way into Ask AI (desktop has it in the sidebar). */
const AskAssistantCard = () => (
  <Link
    to="/assistant"
    className="flex items-center gap-3 rounded-tile bg-card p-4 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
  >
    <EmojiBox emoji="✨" tone="primary" />
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="text-base font-bold text-ink">Ask about your spending</span>
      <span className="truncate text-sm text-muted-foreground">“How much did I spend on food this year?”</span>
    </span>
    <Icon.ChevronRight className="size-5 text-muted-foreground" aria-hidden />
  </Link>
)

export default AskAssistantCard
