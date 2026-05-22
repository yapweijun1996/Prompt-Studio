import { useStore } from '../store/useStore'
import { convertPrompt } from '../lib/convert'
import { saveConversation } from '../lib/history'
import { TemplateBar } from './TemplateBar'
import type { GenerationMode } from '../types'

const PROMPT_TYPES = ['General', 'Code', 'Creative Writing', 'Analysis', 'Summary', 'Translation', 'Email', 'Marketing']

const MODES: { value: GenerationMode; label: string; desc: string }[] = [
  { value: 'creative', label: 'Creative', desc: 'Vivid & expressive' },
  { value: 'balanced', label: 'Balanced', desc: 'Clear & structured' },
  { value: 'strict', label: 'Strict', desc: 'Precise & concise' },
]

export function InputPanel() {
  const store = useStore()

  const isRateLimited = store.rateLimitUntil !== null && store.rateLimitUntil > Date.now()
  const canConvert = store.input.trim().length > 0 && !store.loading && !isRateLimited

  async function handleConvert() {
    if (!canConvert) return
    store.setLoading(true)
    store.resetOutputs()

    try {
      const { rateLimited } = await convertPrompt({
        userPrompt: store.input,
        promptType: store.promptType,
        mode: store.mode,
        provider: store.provider,
        apiKey: store.apiKey,
        model: store.model,
        endpoint: store.endpoint,
        effort: store.effort,
        onCardUpdate: (card) => store.upsertOutput(card),
      })
      if (rateLimited) {
        store.setRateLimitUntil(Date.now() + 60_000)
      }
      // Auto-save to history if at least one variant succeeded.
      const finalOutputs = useStore.getState().outputs
      if (finalOutputs.some((c) => c.status === 'done')) {
        void saveConversation({
          input: store.input,
          promptType: store.promptType,
          mode: store.mode,
          effort: store.effort,
          provider: store.provider,
          model: store.model,
          outputs: finalOutputs,
        }).catch(() => {})
      }
    } finally {
      store.setLoading(false)
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <TemplateBar />

      {/* Prompt type + mode row */}
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-fg-dim font-medium uppercase tracking-wide">Prompt Type</label>
          <select
            value={store.promptType}
            onChange={(e) => store.setPromptType(e.target.value)}
            className="bg-surface-hi border border-line rounded-lg px-3 py-2 text-sm text-fg"
          >
            {PROMPT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-fg-dim font-medium uppercase tracking-wide">Mode</label>
          <div className="flex gap-1.5">
            {MODES.map((m) => (
              <button
                key={m.value}
                onClick={() => store.setMode(m.value)}
                title={m.desc}
                className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                  store.mode === m.value
                    ? 'border-brand bg-brand-tint text-fg'
                    : 'border-line bg-surface-hi text-fg-dim hover:border-line-hi'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        value={store.input}
        onChange={(e) => store.setInput(e.target.value)}
        placeholder="Enter your prompt here…"
        rows={6}
        className="w-full bg-surface border border-line focus:border-brand rounded-xl px-4 py-3 text-sm text-fg placeholder:text-fg-faint resize-none outline-none transition-colors"
      />

      {/* Convert — sticky bottom bar on mobile, inline on desktop */}
      <div className="sticky bottom-0 z-10 -mx-4 px-4 pt-3 pb-[calc(0.75rem_+_env(safe-area-inset-bottom))] flex bg-canvas/90 backdrop-blur border-t border-line md:static md:mx-0 md:p-0 md:bg-transparent md:border-0 md:backdrop-blur-none md:justify-end">
        <button
          onClick={handleConvert}
          disabled={!canConvert}
          className="w-full md:w-auto px-6 py-3 rounded-xl bg-brand hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
        >
          {store.loading && (
            <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          )}
          {store.loading ? 'Generating…' : 'Convert'}
        </button>
      </div>
    </section>
  )
}
