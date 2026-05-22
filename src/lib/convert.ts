import { callGateway } from './providers/gateway'
import { callOpenAI } from './providers/openai'
import { callGemini } from './providers/gemini'
import { callCustom } from './providers/custom'
import type { OutputCard, Provider, EffortLevel, GenerationMode } from '../types'

const VARIANT_PROMPTS: Record<GenerationMode, [string, string, string]> = {
  creative: [
    'You are a creative prompt engineer. Rewrite the given prompt in a vivid, imaginative, and expressive way while preserving the core intent.',
    'You are a creative prompt engineer. Rewrite the given prompt with rich context, metaphors, and detailed framing to inspire diverse AI outputs.',
    'You are a creative prompt engineer. Produce the most concise, evocative version of the given prompt that sparks maximum creativity.',
  ],
  balanced: [
    'You are a prompt optimization expert. Rewrite the given prompt clearly and directly, preserving its original intent without embellishment.',
    'You are a prompt optimization expert. Rewrite the given prompt with added structure and context to improve AI response quality.',
    'You are a prompt optimization expert. Produce a streamlined, high-signal version of the given prompt that is optimized for efficiency.',
  ],
  strict: [
    'You are a technical prompt engineer. Rewrite the given prompt with precise, unambiguous language and clear constraints.',
    'You are a technical prompt engineer. Rewrite the given prompt with explicit instructions, format requirements, and edge case handling.',
    'You are a technical prompt engineer. Distill the given prompt to the minimum necessary tokens while preserving all technical requirements.',
  ],
}

const VARIANT_LABELS = [
  'Option 1 — Direct',
  'Option 2 — Structured',
  'Option 3 — Concise',
]

export type ConvertParams = {
  userPrompt: string
  mode: GenerationMode
  provider: Provider
  apiKey: string
  model: string
  endpoint: string
  effort: EffortLevel
  onCardUpdate: (card: OutputCard) => void
}

export interface ConvertResult {
  rateLimited: boolean
}

export async function convertPrompt(params: ConvertParams): Promise<ConvertResult> {
  const systemPrompts = VARIANT_PROMPTS[params.mode]
  let rateLimited = false

  const tasks = systemPrompts.map((systemPrompt, idx) =>
    (async () => {
      params.onCardUpdate({ id: idx, label: VARIANT_LABELS[idx], text: '', status: 'loading' })
      try {
        const text = await callProvider({
          provider: params.provider,
          apiKey: params.apiKey,
          model: params.model,
          endpoint: params.endpoint,
          effort: params.effort,
          systemPrompt,
          userPrompt: params.userPrompt,
        })
        params.onCardUpdate({ id: idx, label: VARIANT_LABELS[idx], text, status: 'done' })
      } catch (err) {
        const e = err as { status?: number; message?: string }
        if (e.status === 429) rateLimited = true
        params.onCardUpdate({
          id: idx,
          label: VARIANT_LABELS[idx],
          text: '',
          status: 'error',
          error: e.message ?? 'Request failed',
        })
      }
    })()
  )

  await Promise.allSettled(tasks)
  return { rateLimited }
}

type ProviderCallParams = {
  provider: Provider
  apiKey: string
  model: string
  endpoint: string
  effort: EffortLevel
  systemPrompt: string
  userPrompt: string
}

async function callProvider(p: ProviderCallParams): Promise<string> {
  switch (p.provider) {
    case 'default':
      return callGateway({ systemPrompt: p.systemPrompt, userPrompt: p.userPrompt, effort: p.effort })
    case 'openai':
      return callOpenAI({ apiKey: p.apiKey, model: p.model, systemPrompt: p.systemPrompt, userPrompt: p.userPrompt, effort: p.effort })
    case 'gemini':
      return callGemini({ apiKey: p.apiKey, model: p.model, systemPrompt: p.systemPrompt, userPrompt: p.userPrompt, effort: p.effort })
    case 'custom':
      return callCustom({ apiKey: p.apiKey, endpoint: p.endpoint, model: p.model, systemPrompt: p.systemPrompt, userPrompt: p.userPrompt, effort: p.effort })
  }
}
