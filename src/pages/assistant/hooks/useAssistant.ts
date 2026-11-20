import { useState } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAskAssistantMutation } from '@/queries/assistant/assistant-mutations'
import { errorMessage, useUid } from '@/queries/session'
import { ASSISTANT_MODELS, toAssistantModel } from '@/constant/assistantModels'
import { useAssistantStore } from '@/stores/assistant.store'
import { useUIStore } from '@/stores/ui.store'
import type { ChatMessage } from '@/types/assistant'
import { newId } from '@/utils/id'
import { MAX_QUESTION_LENGTH } from '../helpers/AssistantHelpers'

/** The chat: messages (this signed-in user's only), the question being typed, sending and retrying. */
export const useAssistant = () => {
  const isMobile = useIsMobile()
  const uid = useUid()
  const storeUid = useAssistantStore((s) => s.uid)
  const allMessages = useAssistantStore((s) => s.messages)
  const add = useAssistantStore((s) => s.add)
  const reset = useAssistantStore((s) => s.reset)
  const messages = storeUid === uid ? allMessages : []
  const ask = useAskAssistantMutation()
  // the chosen model, saved on this device; a retired one falls back to the default
  const model = toAssistantModel(useUIStore((s) => s.assistantModel))
  const setModel = useUIStore((s) => s.setAssistantModel)
  const [draft, setDraft] = useState('')
  /** The answer while it is being written (streamed), shown in the reply bubble. */
  const [streamingText, setStreamingText] = useState('')
  const send = (raw: string, history: ChatMessage[] = messages) => {
    const question = raw.trim().slice(0, MAX_QUESTION_LENGTH)
    if (!question || !uid || ask.isPending) return
    add(uid, { id: newId(), role: 'user', text: question })
    setDraft('')
    setStreamingText('')
    ask.mutate(
      { history, question, model, onText: setStreamingText },
      {
        onSettled: () => setStreamingText(''),
        onSuccess: (answer) => add(uid, { id: newId(), role: 'assistant', text: answer, model }),
        onError: (error) => add(uid, { id: newId(), role: 'assistant', text: errorMessage(error), error: true }),
      },
    )
  }

  /** Asks the last question again (after an error). */
  const retry = () => {
    const lastQuestion = [...messages].reverse().find((m) => m.role === 'user')
    if (lastQuestion) send(lastQuestion.text, messages.filter((m) => m.id !== lastQuestion.id))
  }

  return {
    isMobile,
    messages,
    draft,
    setDraft,
    send,
    retry,
    isThinking: ask.isPending,
    streamingText,
    newChat: reset,
    model,
    models: ASSISTANT_MODELS,
    setModel,
  }
}

export type AssistantCtx = ReturnType<typeof useAssistant>
