import { useState } from 'react'
import { useStore } from '../store/useStore'
import { OutputCard } from './OutputCard'
import { buildShareUrl } from '../lib/share'

export function OutputList() {
  const outputs = useStore((s) => s.outputs)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')

  if (outputs.length === 0) return null

  const shareableOutputs = outputs.filter((c) => c.status === 'done')
  const hasResult = shareableOutputs.length > 0

  async function handleShare() {
    const s = useStore.getState()
    if (!shareableOutputs.length) return
    try {
      const url = await buildShareUrl({
        input: s.input,
        promptType: s.promptType,
        mode: s.mode,
        effort: s.effort,
        outputs: shareableOutputs,
      })
      await navigator.clipboard.writeText(url)
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 1800)
    } catch {
      setCopyState('failed')
      setTimeout(() => setCopyState('idle'), 1800)
    }
  }

  return (
    <section className="flex flex-col gap-3">
      {hasResult && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] text-fg-faint">
            分享链接会包含当前请求与结果，拿到链接的人都能看到内容。
          </p>
          <button
            onClick={handleShare}
            className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-surface-hi hover:bg-surface-hover text-fg-muted transition-colors"
          >
            {copyState === 'copied'
              ? '链接已复制'
              : copyState === 'failed'
                ? '复制失败'
                : '复制分享链接'}
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
