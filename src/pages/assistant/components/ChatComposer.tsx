import type { KeyboardEvent } from 'react'
import * as Icon from '@/components/icons'
import { IconButton } from '@/components/ui/icon-button'
import { Textarea } from '@/components/ui/textarea'
import { MAX_QUESTION_LENGTH } from '../helpers/AssistantHelpers'
import type { AssistantCtx } from '../hooks/useAssistant'
import ModelSelect from './ModelSelect'

/**
 * [ question ] [ ✨ Fast ▾ ] [ send ] — Enter sends, Shift + Enter adds a new line.
 * Sticks to the bottom (above the tab bar on phones).
 */
const ChatComposer = ({ ctx }: { ctx: AssistantCtx }) => {
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      ctx.send(ctx.draft)
    }
  }

  return (
    <form
      className="sticky bottom-24 flex items-end gap-2.5 rounded-table bg-bg pt-2 lg:bottom-0 lg:pb-1"
      onSubmit={(event) => {
        event.preventDefault()
        ctx.send(ctx.draft)
      }}
    >
      <Textarea
        aria-label="Ask about your spending"
        placeholder="Ask about your spending…"
        rows={1}
        maxLength={MAX_QUESTION_LENGTH}
        value={ctx.draft}
        onChange={(e) => ctx.setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        wrapperClassName="min-w-0 flex-1 bg-card shadow-panel"
      />
      <ModelSelect ctx={ctx} />
      <IconButton type="submit" variant="primary" size="lg" aria-label="Send" disabled={!ctx.draft.trim() || ctx.isThinking} className="mb-1 shrink-0">
        <Icon.SendHorizontal aria-hidden />
      </IconButton>
    </form>
  )
}

export default ChatComposer
