import { useEffect, useRef } from 'react'
import * as Icon from '@/components/icons'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import ChatComposer from './components/ChatComposer'
import ChatIntro from './components/ChatIntro'
import ChatMessages from './components/ChatMessages'
import { useAssistant } from './hooks/useAssistant'

/**
 * Ask AI — a chat about your own spending (not in the design). Gemini (free tier, Firebase AI Logic) reads the question,
 * asks the app for the numbers through tools, and writes the answer (CLAUDE.md §7.6).
 */
const Assistant = () => {
  const ctx = useAssistant()
  const hasMessages = ctx.messages.length > 0
  const endRef = useRef<HTMLDivElement>(null)

  // keep the newest message (or the "thinking" bubble) in view
  useEffect(() => {
    if (ctx.messages.length > 0) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [ctx.messages.length, ctx.isThinking, ctx.streamingText])

  return (
    <div className="mx-auto flex min-h-full max-w-4xl flex-col gap-4">
      <PageHeader
        title="Ask AI"
        description="Questions about your spending, answered from your own data."
        actions={
          hasMessages && (
            <Button variant="surface" onClick={ctx.newChat} disabled={ctx.isThinking}>
              <Icon.Plus aria-hidden />
              New chat
            </Button>
          )
        }
      />
      <div className="flex flex-1 flex-col gap-3">{hasMessages ? <ChatMessages ctx={ctx} /> : <ChatIntro ctx={ctx} />}</div>
      <div ref={endRef} />
      <ChatComposer ctx={ctx} />
      <p className="text-center text-2xs text-muted-foreground">AI can make mistakes. Your question and the figures it needs are sent to Google’s Gemini.</p>
    </div>
  )
}

export default Assistant
