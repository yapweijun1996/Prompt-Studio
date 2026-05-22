import { runAgrun } from './agrun-session'
import type { EffortLevel } from '../../types'

export async function callOpenAI(params: {
  apiKey: string
  model: string
  systemPrompt: string
  userPrompt: string
  effort: EffortLevel
}): Promise<string> {
  return runAgrun({
    provider: 'openai',
    apiKey: params.apiKey,
    model: params.model,
    prompt: params.userPrompt,
    systemPrompt: params.systemPrompt,
    apiVariant: 'responses',
    reasoningEffort: params.effort,
  })
}
