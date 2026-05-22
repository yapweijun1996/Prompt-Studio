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
          ? 'border-brand bg-surface shadow-lg shadow-brand/20'
          : 'border-line bg-surface hover:border-line-hi'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-fg-dim tracking-wide uppercase">{card.label}</span>
        {isSelected && (
          <span className="text-[10px] font-bold text-brand bg-brand-tint px-2 py-0.5 rounded-full">
            Selected
          </span>
        )}
      </div>

      {card.status === 'loading' && (
        <div className="flex items-center gap-2 text-fg-faint text-sm py-4">
          <span className="inline-block w-4 h-4 rounded-full border-2 border-line-hi border-t-brand animate-spin" />
          Generating…
        </div>
      )}

      {card.status === 'error' && (
        <div className="text-danger text-sm py-2">{card.error ?? 'Request failed'}</div>
      )}

      {card.status === 'done' && (
        <p className="text-fg text-sm leading-relaxed whitespace-pre-wrap">{card.text}</p>
      )}

      {card.status === 'done' && (
        <div className="flex gap-2 mt-auto pt-1">
          <button
            onClick={handleCopy}
            className="flex-1 py-1.5 rounded-lg bg-surface-hi hover:bg-surface-hover text-xs text-fg-muted transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={() => setSelectedIndex(isSelected ? null : card.id)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isSelected
                ? 'bg-surface-hover text-fg-muted'
                : 'bg-brand hover:bg-brand-hover text-white'
            }`}
          >
            {isSelected ? 'Deselect' : 'Select'}
          </button>
        </div>
      )}
    </div>
  )
}
