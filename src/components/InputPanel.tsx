import { useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import { convertPrompt } from '../lib/convert'
import { saveConversation } from '../lib/history'
import { TemplateBar } from './TemplateBar'
import type { GenerationMode } from '../types'

const PROMPT_TYPES: { value: string; label: string }[] = [
  { value: 'General', label: '通用' },
  { value: 'Code', label: '代码' },
  { value: 'Coding Agent', label: '编码代理' },
  { value: 'Creative Writing', label: '创意写作' },
  { value: 'Analysis', label: '分析' },
  { value: 'Summary', label: '总结' },
  { value: 'Translation', label: '翻译' },
  { value: 'Email', label: '邮件' },
  { value: 'Marketing', label: '营销' },
]

const MODES: { value: GenerationMode; label: string; desc: string }[] = [
  { value: 'creative', label: '创意', desc: '更多变体和想象空间' },
  { value: 'balanced', label: '平衡', desc: '清晰、稳定' },
  { value: 'strict', label: '严谨', desc: '更精确、可复用' },
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

  // Keep a live ref so the global shortcut always calls the latest closure.
  const convertRef = useRef(handleConvert)
  convertRef.current = handleConvert

  // Desktop keyboard shortcuts: Cmd/Ctrl+Enter converts; 1/2/3 pick a variant.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        void convertRef.current()
        return
      }
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === '1' || e.key === '2' || e.key === '3') {
        const idx = Number(e.key) - 1
        const s = useStore.getState()
        if (s.outputs[idx]?.status === 'done') {
          s.setSelectedIndex(s.selectedIndex === idx ? null : idx)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <section className="flex flex-col gap-4">
      <TemplateBar />

      {/* Prompt type + mode row */}
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-fg-dim font-medium uppercase tracking-wide">提示类型</label>
          <select
            value={store.promptType}
            onChange={(e) => store.setPromptType(e.target.value)}
            className="bg-surface-hi border border-line rounded-lg px-3 py-2 text-sm text-fg"
          >
            {PROMPT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-fg-dim font-medium uppercase tracking-wide">输出风格</label>
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
        placeholder="在这里输入你的原始请求，例如：帮我修复某个 bug..."
        rows={6}
        className="w-full bg-surface border border-line focus:border-brand rounded-xl px-4 py-3 text-sm text-fg placeholder:text-fg-faint resize-none outline-none transition-colors"
      />

      {/* Convert — sticky bottom bar on mobile, inline on desktop */}
      <div className="sticky bottom-0 z-10 -mx-4 px-4 pt-3 pb-[calc(0.75rem_+_env(safe-area-inset-bottom))] flex bg-canvas/90 backdrop-blur border-t border-line md:static md:mx-0 md:p-0 md:bg-transparent md:border-0 md:backdrop-blur-none md:justify-end">
        <button
          onClick={handleConvert}
          disabled={!canConvert}
          title="生成优化提示（Ctrl / ⌘ + Enter）"
          className="w-full md:w-auto px-6 py-3 rounded-xl bg-brand hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
        >
          {store.loading && (
            <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          )}
          {store.loading ? '正在生成...' : '生成'}
        </button>
      </div>
    </section>
  )
}
