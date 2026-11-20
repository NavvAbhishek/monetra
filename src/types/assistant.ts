/** One message in the spending assistant chat (kept in memory for the session only, never saved). */
export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  /** The assistant's reply failed — the text is the error to show. */
  error?: boolean
  /** Model that wrote this answer (shown under it). */
  model?: string
}
