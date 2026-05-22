import { xorDecrypt } from '../xor'
import { runAgrun } from './agrun-session'
import type { EffortLevel } from '../../types'

// XOR-obfuscated demo gateway key (cipher key: "20260515")
const ENCRYPTED_DEMO_KEY = '55476d03020157540302540f015606015100535702045502015650575102530c0551000151025557015207570657020605000a'

const GATEWAY_ENDPOINT = 'https://gpt.yapweijun1996.com/v1'
const GATEWAY_MODEL = 'gpt-5.4-mini'

function getDemoKey(): string {
  return xorDecrypt(ENCRYPTED_DEMO_KEY)
}

export async function callGateway(params: {
  systemPrompt: string
  userPrompt: string
  effort: EffortLevel
}): Promise<string> {
  return runAgrun({
    provider: 'openai',
    apiKey: getDemoKey(),
    endpoint: GATEWAY_ENDPOINT,
    model: GATEWAY_MODEL,
    prompt: params.userPrompt,
    systemPrompt: params.systemPrompt,
    apiVariant: 'responses',
    // gpt-5.4-mini does not support xhigh — cap at high.
    reasoningEffort: params.effort === 'xhigh' ? 'high' : params.effort,
  })
}
