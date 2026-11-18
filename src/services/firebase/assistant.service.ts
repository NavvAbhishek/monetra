import type { FunctionDeclaration, ObjectSchema, Part } from 'firebase/ai'
import { FirebaseError } from 'firebase/app'
import { getFirebaseAI, isAssistantConfigured } from '@/lib/firebase'
import { DEFAULT_CURRENCY } from '@/utils/money'
import type { AssistantService } from '../contracts'
import { ServiceError } from '../errors'
import { ASSISTANT_TOOLS, type AssistantData, buildSystemInstruction, runAssistantTool, type ToolSpec } from '../assistant/tools'
import { categoriesFirebase } from './categories.service'
import { expensesFirebase } from './expenses.service'
import { pastRecordsFirebase } from './pastRecords.service'
import { profileFirebase } from './profile.service'

/**
 * Model name. Gemini models are retired over time — when Google retires this one, set VITE_GEMINI_MODEL in .env.local
 * (and the GitHub secret) to a current free-tier "flash" model listed in Firebase console → AI Logic.
 */
const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3.7-flash'
/** How many tool round-trips one question may take (a comparison needs a few). */
const MAX_TOOL_ROUNDS = 6
/** Earlier messages sent along for context. */
const HISTORY_LIMIT = 12

type SchemaHelpers = typeof import('firebase/ai')['Schema']

const toSchema = (Schema: SchemaHelpers, spec: ToolSpec): ObjectSchema => {
  const properties = Object.fromEntries(
    Object.entries(spec.params).map(([key, p]) => [
      key,
      p.enum ? Schema.enumString({ enum: p.enum, description: p.description }) : p.type === 'integer' ? Schema.integer({ description: p.description }) : Schema.string({ description: p.description }),
    ]),
  )
  const optionalProperties = Object.entries(spec.params).filter(([, p]) => p.optional).map(([key]) => key)
  return Schema.object({ properties, optionalProperties })
}

const toDeclarations = (Schema: SchemaHelpers): FunctionDeclaration[] =>
  ASSISTANT_TOOLS.map((spec) => ({ name: spec.name, description: spec.description, parameters: toSchema(Schema, spec) }))

/** AI / network failures → messages a user can act on. */
const toAssistantError = (error: unknown): ServiceError => {
  const raw = error instanceof Error ? `${error.message} ${error instanceof FirebaseError ? error.code : ''}` : String(error)
  if (/429|RESOURCE_EXHAUSTED|quota/i.test(raw)) {
    return new ServiceError('assistant/quota', 'The free AI limit is used up for now. Try again in a little while.')
  }
  if (/app.?check|401|403|PERMISSION_DENIED|unauthenticated/i.test(raw)) {
    return new ServiceError('assistant/unavailable', 'The assistant couldn’t verify this app. Reload the page and try again.')
  }
  if (/404|not found|not supported for generateContent/i.test(raw)) {
    return new ServiceError('assistant/unavailable', `The AI model “${MODEL}” isn’t available any more. Set a current model in VITE_GEMINI_MODEL.`)
  }
  if (/network|fetch|offline/i.test(raw)) return new ServiceError('network', 'You’re offline. Check your connection and try again.')
  return new ServiceError('assistant/unavailable', 'The assistant couldn’t answer right now. Please try again.')
}

const loadData = async (uid: string): Promise<AssistantData> => {
  const [profile, categories] = await Promise.all([profileFirebase.profile_get(uid), categoriesFirebase.category_list(uid)])
  let records: Promise<Awaited<ReturnType<typeof pastRecordsFirebase.pastRecord_list>>> | undefined
  return {
    currency: profile?.currency ?? DEFAULT_CURRENCY,
    categories,
    listExpenses: (range) => expensesFirebase.expense_listInRange(uid, range),
    // past records are read once per question, whatever the number of tool calls
    listPastRecords: () => (records ??= pastRecordsFirebase.pastRecord_list(uid).catch(() => [])),
  }
}

export const assistantFirebase: AssistantService = {
  assistant_ask: async (uid, { history, question }) => {
    if (!isAssistantConfigured()) {
      throw new ServiceError('assistant/not-configured', 'The assistant isn’t set up yet (VITE_RECAPTCHA_SITE_KEY is missing).')
    }
    try {
      // the AI SDK is downloaded only now (keeps it out of every other page)
      const [data, ai, { getGenerativeModel, Schema }] = await Promise.all([loadData(uid), getFirebaseAI(), import('firebase/ai')])
      const model = getGenerativeModel(ai, {
        model: MODEL,
        systemInstruction: buildSystemInstruction(data),
        tools: [{ functionDeclarations: toDeclarations(Schema) }],
      })
      const chat = model.startChat({
        history: history
          .filter((m) => !m.error)
          .slice(-HISTORY_LIMIT)
          .map((m) => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ type: 'text', text: m.text }] })),
      })

      let result = await chat.sendMessage(question)
      for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
        const calls = result.response.functionCalls()
        if (!calls || calls.length === 0) break
        const parts: Part[] = await Promise.all(
          calls.map(async (call) => ({
            type: 'functionResponse' as const,
            functionResponse: { id: call.id, name: call.name, response: await runAssistantTool(call.name, call.args as Record<string, unknown>, data) },
          })),
        )
        result = await chat.sendMessage(parts)
      }
      const answer = result.response.text().trim()
      return answer || 'Sorry, I couldn’t work that out. Try asking another way.'
    } catch (error) {
      if (import.meta.env.DEV) console.error('[assistant]', error)
      if (error instanceof ServiceError) throw error
      throw toAssistantError(error)
    }
  },
}
