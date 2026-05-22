import { useState } from 'react'
import { useStore } from '../store/useStore'
import { OutputCard } from './OutputCard'
import { buildShareUrl } from '../lib/share'

export function OutputList() {
  const outputs = useStore((s) => s.outputs)
  const [copied, setCopied] = useState(false)

  if (outputs.length === 0) return null

  const hasResult = outputs.some((c) => c.status === 'done')

  async function handleShare() {
    const s = useStore.getState()
    const url = buildShareUrl({
      input: s.input,
      promptType: s.promptType,
      mode: s.mode,
      effort: s.effort,
      outputs: s.outputs,
    })
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <section className="flex flex-col gap-3">
      {hasResult && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] text-fg-faint">
            The share link embeds your prompt and outputs — anyone with it can read them.
          </p>
          <button
            onClick={handleShare}
            className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-surface-hi hover:bg-surface-hover text-fg-muted transition-colors"
          >
            {copied ? 'Link copied!' : 'Copy share link'}
          </button>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        {outputs.map((card) => (
          <OutputCard key={card.id} card={card} />
        ))}
      </div>
    </section>
  )
}
