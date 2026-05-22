import { useStore } from '../store/useStore'
import { convertPrompt } from '../lib/convert'
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
    } finally {
      store.setLoading(false)
    }
  }

  return (
    <section className="flex flex-col gap-4">
      {/* Prompt type + mode row */}
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400 font-medium uppercase tracking-wide">Prompt Type</label>
          <select
            value={store.promptType}
            onChange={(e) => store.setPromptType(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
          >
            {PROMPT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400 font-medium uppercase tracking-wide">Mode</label>
          <div className="flex gap-1.5">
            {MODES.map((m) => (
              <button
                key={m.value}
                onClick={() => store.setMode(m.value)}
                title={m.desc}
                className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                  store.mode === m.value
                    ? 'border-[oklch(0.55_0.22_260)] bg-[oklch(0.55_0.22_260/0.15)] text-white'
                    : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
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
        className="w-full bg-slate-900 border border-slate-700 focus:border-[oklch(0.55_0.22_260)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 resize-none outline-none transition-colors"
      />

      {/* Convert button */}
      <button
        onClick={handleConvert}
        disabled={!canConvert}
        className="self-end px-6 py-2.5 rounded-xl bg-[oklch(0.55_0.22_260)] hover:bg-[oklch(0.45_0.18_260)] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all flex items-center gap-2"
      >
        {store.loading && (
          <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        )}
        {store.loading ? 'Generating…' : 'Convert'}
      </button>
    </section>
  )
}
