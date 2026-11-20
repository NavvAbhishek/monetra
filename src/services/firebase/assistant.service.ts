import type { Content, FunctionDeclaration, ObjectSchema, Part } from 'firebase/ai'
import { FirebaseError } from 'firebase/app'
import { toAssistantModel } from '@/constant/assistantModels'
import { getFirebaseAI, isAssistantConfigured } from '@/lib/firebase'
import { DEFAULT_CURRENCY } from '@/utils/money'
import type { AssistantService } from '../contracts'
import { ServiceError } from '../errors'
import { ASSISTANT_TOOLS, type AssistantData, buildQuickFacts, buildSystemInstruction, runAssistantTool, type ToolSpec } from '../assistant/tools'
import { categoriesFirebase } from './categories.service'
import { expensesFirebase } from './expenses.service'
import { pastRecordsFirebase } from './pastRecords.service'
import { profileFirebase } from './profile.service'

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
const toAssistantError = (error: unknown, model: string): ServiceError => {
  const raw = error instanceof Error ? `${error.message} ${error instanceof FirebaseError ? error.code : ''}` : String(error)
  if (/429|RESOURCE_EXHAUSTED|quota/i.test(raw)) {
    return new ServiceError('assistant/quota', 'The free AI limit is used up for now. Try again in a little while.')
  }
  if (/app.?check|401|403|PERMISSION_DENIED|unauthenticated/i.test(raw)) {
    return new ServiceError('assistant/unavailable', 'The assistant couldn’t verify this app. Reload the page and try again.')
  }
  if (/404|not found|not supported for generateContent/i.test(raw)) {
    return new ServiceError('assistant/unavailable', `The model “${model}” isn’t available right now. Pick another model at the top of the page.`)
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
  assistant_ask: async (uid, { history, question, model: requestedModel, onText }) => {
    const modelId = toAssistantModel(requestedModel)
    if (!isAssistantConfigured()) {
      throw new ServiceError('assistant/not-configured', 'The assistant isn’t set up yet (VITE_RECAPTCHA_SITE_KEY is missing).')
    }
    try {
      // the AI SDK is downloaded only now (keeps it out of every other page)
      const [data, ai, { getGenerativeModel, Schema, ThinkingLevel }] = await Promise.all([loadData(uid), getFirebaseAI(), import('firebase/ai')])
      const declarations = toDeclarations(Schema)
      const systemInstruction = buildSystemInstruction(data, await buildQuickFacts(data))
      const historyContent: Content[] = history
        .filter((m) => !m.error)
        .slice(-HISTORY_LIMIT)
        .map((m): Content => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ type: 'text' as const, text: m.text }] }))

      const answer = async (fastThinking: boolean) => {
        const model = getGenerativeModel(ai, {
          model: modelId,
          systemInstruction,
          tools: [{ functionDeclarations: declarations }],
          // Gemini 3 "thinks" before answering by default (~30 s per call on the free tier). Spending questions only
          // need to pick a tool and phrase the result, so LOW thinking is enough. (MINIMAL is rejected by this model: 400.)
          ...(fastThinking ? { generationConfig: { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } } } : {}),
        })
        const chat = model.startChat({ history: historyContent })

        /** One round, streamed: the answer text is passed to `onText` as it arrives. */
        const send = async (request: string | Part[]) => {
          const { stream, response } = await chat.sendMessageStream(request)
          let soFar = ''
          for await (const chunk of stream) {
            const piece = chunk.text()
            if (piece) {
              soFar += piece
              onText?.(soFar)
            }
          }
          return response
        }

        let response = await send(question)
        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
          const calls = response.functionCalls()
          if (!calls || calls.length === 0) break
          const parts: Part[] = await Promise.all(
            calls.map(async (call) => ({
              type: 'functionResponse' as const,
              functionResponse: { id: call.id, name: call.name, response: await runAssistantTool(call.name, call.args as Record<string, unknown>, data) },
            })),
          )
          response = await send(parts)
        }
        return response.text().trim()
      }

      let text: string
      try {
        text = await answer(true)
      } catch (error) {
        // a model without thinking levels rejects the setting — ask again with the model's default
        if (!/thinking/i.test(error instanceof Error ? error.message : '')) throw error
        text = await answer(false)
      }
      return text || 'Sorry, I couldn’t work that out. Try asking another way.'
    } catch (error) {
      if (import.meta.env.DEV) console.error('[assistant]', error)
      if (error instanceof ServiceError) throw error
      throw toAssistantError(error, modelId)
    }
  },
}
