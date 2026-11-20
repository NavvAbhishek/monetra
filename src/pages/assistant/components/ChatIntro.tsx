import * as Icon from '@/components/icons'
import { Button } from '@/components/ui/button'
import { EmojiBox } from '@/components/ui/emoji-box'
import { SUGGESTED_QUESTIONS } from '../helpers/AssistantHelpers'
import type { AssistantCtx } from '../hooks/useAssistant'

/** Empty chat: what the assistant can do + starter questions to tap. */
const ChatIntro = ({ ctx }: { ctx: AssistantCtx }) => (
  <section className="flex flex-col items-center gap-3 px-2 py-8 text-center" aria-label="Suggested questions">
    <EmojiBox emoji="✨" size="xl" tone="primary" />
    <h2 className="pt-1 text-2xl font-extrabold text-ink">Ask about your spending</h2>
    <p className="max-w-md text-base text-muted-foreground">
      Totals, categories, trends and your biggest expenses — including your past spending. The numbers come straight from your data.
    </p>
    <div className="flex max-w-2xl flex-wrap justify-center gap-2 pt-3">
      {SUGGESTED_QUESTIONS.map((q) => (
        <Button key={q} variant="secondary" size="sm" onClick={() => ctx.send(q)} disabled={ctx.isThinking}>
          <Icon.Sparkles aria-hidden />
          {q}
        </Button>
      ))}
    </div>
  </section>
)

export default ChatIntro
