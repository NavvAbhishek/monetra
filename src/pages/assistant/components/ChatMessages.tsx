import * as Icon from '@/components/icons'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { AssistantCtx } from '../hooks/useAssistant'
import AssistantText from './AssistantText'

/** The conversation: your questions on the right, answers on the left, a "thinking" bubble while waiting. */
const ChatMessages = ({ ctx }: { ctx: AssistantCtx }) => {
  const lastId = ctx.messages.at(-1)?.id
  return (
    <ol className="flex flex-col gap-3" aria-live="polite" aria-label="Conversation">
      {ctx.messages.map((m) =>
        m.role === 'user' ? (
          <li key={m.id} className="ml-10 max-w-xl self-end rounded-tile rounded-br-check bg-primary px-4 py-2.5 text-base whitespace-pre-wrap text-primary-foreground">
            {m.text}
          </li>
        ) : (
          <li
            key={m.id}
            className={cn(
              'mr-6 flex max-w-2xl gap-2.5 self-start rounded-tile rounded-bl-check px-4 py-3 text-base',
              m.error ? 'bg-danger-soft text-danger' : 'bg-card text-ink shadow-panel',
            )}
          >
            {m.error ? <Icon.TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden /> : <Icon.Sparkles className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />}
            <div className="flex min-w-0 flex-col gap-2">
              {m.error ? <p>{m.text}</p> : <AssistantText text={m.text} />}
              {m.error && m.id === lastId && !ctx.isThinking && (
                <Button size="sm" variant="danger-soft" onClick={ctx.retry} className="self-start">
                  <Icon.RotateCcw aria-hidden />
                  Try again
                </Button>
              )}
            </div>
          </li>
        ),
      )}
      {ctx.isThinking && (
        <li className="flex items-center gap-2.5 self-start rounded-tile rounded-bl-check bg-card px-4 py-3 text-base text-muted-foreground shadow-panel">
          <Icon.Sparkles className="size-4 animate-pulse text-primary" aria-hidden />
          Looking at your spending…
        </li>
      )}
    </ol>
  )
}

export default ChatMessages
