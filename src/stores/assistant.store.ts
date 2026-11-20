import { create } from 'zustand'
import type { ChatMessage } from '@/types/assistant'

type AssistantState = {
  /** Whose chat this is — a different signed-in user starts empty. */
  uid: string | null
  messages: ChatMessage[]
  add: (uid: string, message: ChatMessage) => void
  reset: () => void
}

/**
 * The assistant chat. In memory only (not persisted, never saved to Firestore): it survives moving between
 * pages and is gone after a reload or sign-out.
 */
export const useAssistantStore = create<AssistantState>()((set) => ({
  uid: null,
  messages: [],
  add: (uid, message) => set((s) => ({ uid, messages: s.uid === uid ? [...s.messages, message] : [message] })),
  reset: () => set({ uid: null, messages: [] }),
}))
