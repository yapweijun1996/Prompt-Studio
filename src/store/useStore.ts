import { create } from 'zustand'
import { loadApiKey, saveApiKey } from '../lib/xor'
import type { OutputCard, Provider, EffortLevel, GenerationMode, Theme } from '../types'

const THEME_KEY = 'ps_theme'

function getInitialTheme(): Theme {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  localStorage.setItem(THEME_KEY, theme)
}

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
  theme: Theme

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
  toggleTheme: () => void
}

const SETTINGS_KEY = 'ps_settings'

// Each provider needs a model id from its own namespace. Switching provider
// must reset the model, or e.g. Gemini would be called with "gpt-5.4-mini".
const DEFAULT_MODELS: Record<Provider, string> = {
  default: 'gpt-5.4-mini',
  openai: 'gpt-5.4-mini',
  gemini: 'gemini-2.5-flash',
  custom: '',
}

// Repairs a provider/model mismatch from previously-persisted settings
// (e.g. provider switched to gemini before the reset fix existed).
function initialModel(provider: Provider, savedModel?: string): string {
  if (!savedModel) return DEFAULT_MODELS[provider]
  const looksGemini = savedModel.toLowerCase().includes('gemini')
  if (provider === 'gemini' && !looksGemini) return DEFAULT_MODELS.gemini
  if ((provider === 'openai' || provider === 'default') && looksGemini) return DEFAULT_MODELS[provider]
  return savedModel
}

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
const initialProvider: Provider = saved.provider ?? 'default'

export const useStore = create<StoreState>((set, get) => ({
  input: '',
  promptType: saved.promptType ?? 'General',
  mode: saved.mode ?? 'balanced',
  effort: saved.effort ?? 'medium',
  provider: initialProvider,
  model: initialModel(initialProvider, saved.model),
  apiKey: loadApiKey(),
  endpoint: saved.endpoint ?? '',
  loading: false,
  outputs: [],
  selectedIndex: null,
  rateLimitUntil: null,
  theme: getInitialTheme(),

  setInput: (v) => set({ input: v }),
  setPromptType: (v) => { set({ promptType: v }); persistSettings({ ...get(), promptType: v }) },
  setMode: (v) => { set({ mode: v }); persistSettings({ ...get(), mode: v }) },
  setEffort: (v) => { set({ effort: v }); persistSettings({ ...get(), effort: v }) },
  setProvider: (v) => {
    const model = DEFAULT_MODELS[v]
    set({ provider: v, model })
    persistSettings({ ...get(), provider: v, model })
  },
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
  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    set({ theme: next })
  },
}))
