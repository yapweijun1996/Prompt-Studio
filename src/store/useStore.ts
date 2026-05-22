import { create } from 'zustand'
import { loadApiKey, saveApiKey } from '../lib/xor'
import type { OutputCard, Provider, EffortLevel, GenerationMode } from '../types'

interface StoreState {
  input: string
  promptType: string
  mode: GenerationMode
  effort: EffortLevel
  provider: Provider
  model: string
  apiKey: string
  endpoint: string
  loading: boolean
  outputs: OutputCard[]
  selectedIndex: number | null
  rateLimitUntil: number | null

  setInput: (v: string) => void
  setPromptType: (v: string) => void
  setMode: (v: GenerationMode) => void
  setEffort: (v: EffortLevel) => void
  setProvider: (v: Provider) => void
  setModel: (v: string) => void
  setApiKey: (v: string) => void
  setEndpoint: (v: string) => void
  setLoading: (v: boolean) => void
  upsertOutput: (card: OutputCard) => void
  resetOutputs: () => void
  setSelectedIndex: (i: number | null) => void
  setRateLimitUntil: (ts: number | null) => void
}

const SETTINGS_KEY = 'ps_settings'

function loadSettings(): Partial<StoreState> {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? (JSON.parse(raw) as Partial<StoreState>) : {}
  } catch {
    return {}
  }
}

function persistSettings(state: StoreState) {
  const { provider, model, endpoint, effort, mode, promptType } = state
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ provider, model, endpoint, effort, mode, promptType }))
}

const saved = loadSettings()

export const useStore = create<StoreState>((set, get) => ({
  input: '',
  promptType: saved.promptType ?? 'General',
  mode: saved.mode ?? 'balanced',
  effort: saved.effort ?? 'medium',
  provider: saved.provider ?? 'default',
  model: saved.model ?? 'gpt-5.4-mini',
  apiKey: loadApiKey(),
  endpoint: saved.endpoint ?? '',
  loading: false,
  outputs: [],
  selectedIndex: null,
  rateLimitUntil: null,

  setInput: (v) => set({ input: v }),
  setPromptType: (v) => { set({ promptType: v }); persistSettings({ ...get(), promptType: v }) },
  setMode: (v) => { set({ mode: v }); persistSettings({ ...get(), mode: v }) },
  setEffort: (v) => { set({ effort: v }); persistSettings({ ...get(), effort: v }) },
  setProvider: (v) => { set({ provider: v }); persistSettings({ ...get(), provider: v }) },
  setModel: (v) => { set({ model: v }); persistSettings({ ...get(), model: v }) },
  setApiKey: (v) => { saveApiKey(v); set({ apiKey: v }) },
  setEndpoint: (v) => { set({ endpoint: v }); persistSettings({ ...get(), endpoint: v }) },
  setLoading: (v) => set({ loading: v }),
  upsertOutput: (card) =>
    set((s) => {
      const list = [...s.outputs]
      const idx = list.findIndex((c) => c.id === card.id)
      if (idx >= 0) list[idx] = card
      else list.push(card)
      return { outputs: list }
    }),
  resetOutputs: () => set({ outputs: [], selectedIndex: null }),
  setSelectedIndex: (i) => set({ selectedIndex: i }),
  setRateLimitUntil: (ts) => set({ rateLimitUntil: ts }),
}))
