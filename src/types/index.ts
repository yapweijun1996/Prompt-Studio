export type Provider = 'default' | 'openai' | 'gemini' | 'custom'

export type EffortLevel = 'low' | 'medium' | 'high' | 'xhigh'

export type GenerationMode = 'creative' | 'balanced' | 'strict'

export type Theme = 'light' | 'dark'

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

// A named preset of the settings a user re-types each session.
export interface Template {
  id?: number
  name: string
  promptType: string
  mode: GenerationMode
  effort: EffortLevel
  createdAt: number
}

// One saved Convert run — auto-written to IndexedDB on every conversion.
export interface Conversation {
  id?: number
  title: string          // derived from the input's first line
  input: string
  promptType: string
  mode: GenerationMode
  effort: EffortLevel
  provider: Provider
  model: string
  outputs: OutputCard[]
  pinned: boolean
  createdAt: number      // epoch ms
}
