/**
 * The free Gemini models the Ask AI chat can use (CLAUDE.md §7.6). Only models Firebase marks
 * "billing not required" for the Gemini Developer API — they work on the Spark plan.
 * Source: https://firebase.google.com/docs/ai-logic/models (checked 2026-11-18). Google retires models over
 * time: when one is shut down, replace it here (a stored choice that is no longer listed falls back to the default).
 */
export const ASSISTANT_MODELS = [
  {
    id: 'gemini-3.5-flash-lite',
    label: 'Fast',
    name: 'Gemini 3.5 Flash-Lite',
    description: 'Quickest answers — best for everyday questions.',
  },
  {
    id: 'gemini-3.8-flash',
    label: 'Balanced',
    name: 'Gemini 3.8 Flash',
    description: 'Better with tricky or multi-step questions. Slower.',
  },
  {
    id: 'gemini-4-hydrogen',
    label: 'Smartest',
    name: 'Gemini 4 Hydrogen',
    description: 'The most capable free model. Can be the slowest.',
  },
] as const

export type AssistantModelId = (typeof ASSISTANT_MODELS)[number]['id']

export const DEFAULT_ASSISTANT_MODEL: AssistantModelId = 'gemini-3.5-flash-lite'

/** A known model id, or the default (e.g. a stored choice Google has since retired). */
export const toAssistantModel = (id: string | null | undefined): AssistantModelId =>
  ASSISTANT_MODELS.find((m) => m.id === id)?.id ?? DEFAULT_ASSISTANT_MODEL

export const getAssistantModel = (id: string) => ASSISTANT_MODELS.find((m) => m.id === toAssistantModel(id)) ?? ASSISTANT_MODELS[0]
