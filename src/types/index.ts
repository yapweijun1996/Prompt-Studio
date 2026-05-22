export type Provider = 'default' | 'openai' | 'gemini' | 'custom'

export type EffortLevel = 'low' | 'medium' | 'high' | 'xhigh'

export type GenerationMode = 'creative' | 'balanced' | 'strict'

export interface OutputCard {
  id: number
  label: string
  text: string
  status: 'loading' | 'done' | 'error'
  error?: string
}

export interface Settings {
  provider: Provider
  model: string
  apiKey: string       // plaintext in memory
  endpoint: string     // for custom provider
  effort: EffortLevel
  mode: GenerationMode
  thinkingBudget: number
}

export interface Template {
  id?: number
  name: string
  promptType: string
  systemPrompt: string
  createdAt: Date
}
