import { useMutation } from '@tanstack/react-query'
import API from '@/services'
import type { AssistantAskInput } from '@/services/contracts'
import { requireUid } from '../session'

/** Asks the spending assistant. No toasts: the chat shows answers and errors itself. */
export const useAskAssistantMutation = () =>
  useMutation({
    mutationFn: (input: AssistantAskInput) => API.assistant.assistant_ask(requireUid(), input),
  })
