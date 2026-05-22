import { useState } from 'react'
import { useStore } from '../store/useStore'
import type { OutputCard as OutputCardType } from '../types'

export function OutputCard({ card }: { card: OutputCardType }) {
  const selectedIndex = useStore((s) => s.selectedIndex)
  const setSelectedIndex = useStore((s) => s.setSelectedIndex)
  const [copied, setCopied] = useState(false)

  const isSelected = selectedIndex === card.id

  async function handleCopy() {
    await navigator.clipboard.writeText(card.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      className={`relative flex flex-col gap-3 rounded-2xl border p-5 transition-all ${
        isSelected
          ? 'border-[oklch(0.55_0.22_260)] bg-slate-800/80 shadow-lg shadow-[oklch(0.55_0.22_260/0.15)]'
          : 'border-slate-700 bg-slate-900 hover:border-slate-600'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">{card.label}</span>
        {isSelected && (
          <span className="text-[10px] font-bold text-[oklch(0.55_0.22_260)] bg-[oklch(0.55_0.22_260/0.12)] px-2 py-0.5 rounded-full">
            Selected
          </span>
        )}
      </div>

      {card.status === 'loading' && (
        <div className="flex items-center gap-2 text-slate-500 text-sm py-4">
          <span className="inline-block w-4 h-4 rounded-full border-2 border-slate-600 border-t-slate-300 animate-spin" />
          Generating…
        </div>
      )}

      {card.status === 'error' && (
        <div className="text-red-400 text-sm py-2">{card.error ?? 'Request failed'}</div>
      )}

      {card.status === 'done' && (
        <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{card.text}</p>
      )}

      {card.status === 'done' && (
        <div className="flex gap-2 mt-auto pt-1">
          <button
            onClick={handleCopy}
            className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={() => setSelectedIndex(isSelected ? null : card.id)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isSelected
                ? 'bg-slate-700 text-slate-300'
                : 'bg-[oklch(0.55_0.22_260)] hover:bg-[oklch(0.45_0.18_260)] text-white'
            }`}
          >
            {isSelected ? 'Deselect' : 'Select'}
          </button>
        </div>
      )}
    </div>
  )
}
