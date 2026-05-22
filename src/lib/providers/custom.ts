import { runAgrun } from './agrun-session'
import type { EffortLevel } from '../../types'

export async function callCustom(params: {
  apiKey: string
  endpoint: string
  model: string
  systemPrompt: string
  userPrompt: string
  effort: EffortLevel
}): Promise<string> {
  return runAgrun({
    provider: 'openai',
    apiKey: params.apiKey,
    endpoint: params.endpoint,
    model: params.model,
    prompt: params.userPrompt,
    systemPrompt: params.systemPrompt,
    apiVariant: 'responses',
    reasoningEffort: params.effort,
  })
}
