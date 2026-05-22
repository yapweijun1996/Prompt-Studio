import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../store/db'
import { useStore } from '../store/useStore'
import { STARTER_TEMPLATES, saveTemplate, deleteTemplate, type TemplatePreset } from '../lib/templates'

const chip =
  'text-xs px-2.5 py-1 rounded-full border border-line bg-surface-hi text-fg-dim hover:border-line-hi transition-colors'

export function TemplateBar() {
  const promptType = useStore((s) => s.promptType)
  const mode = useStore((s) => s.mode)
  const effort = useStore((s) => s.effort)
  const setPromptType = useStore((s) => s.setPromptType)
  const setMode = useStore((s) => s.setMode)
  const setEffort = useStore((s) => s.setEffort)

  const templates = useLiveQuery(() => db.templates.orderBy('createdAt').toArray(), [])
  const [naming, setNaming] = useState(false)
  const [name, setName] = useState('')

  function apply(t: TemplatePreset) {
    setPromptType(t.promptType)
    setMode(t.mode)
    setEffort(t.effort)
  }

  async function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) return
    await saveTemplate({ name: trimmed, promptType, mode, effort })
    setName('')
    setNaming(false)
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-fg-dim font-medium uppercase tracking-wide">Templates</label>
      <div className="flex flex-wrap items-center gap-1.5">
        {STARTER_TEMPLATES.map((t) => (
          <button key={t.name} onClick={() => apply(t)} className={chip} title={`${t.promptType} · ${t.mode} · ${t.effort}`}>
            {t.name}
          </button>
        ))}

        {(templates ?? []).map((t) => (
          <span key={t.id} className="inline-flex items-center">
            <button
              onClick={() => apply(t)}
              className={`${chip} rounded-r-none`}
              title={`${t.promptType} · ${t.mode} · ${t.effort}`}
            >
              {t.name}
            </button>
            <button
              onClick={() => deleteTemplate(t.id as number)}
              className="text-xs px-1.5 py-1 rounded-r-full border border-l-0 border-line bg-surface-hi text-fg-faint hover:text-danger"
              aria-label={`Delete template ${t.name}`}
              title="Delete template"
            >
              &times;
            </button>
          </span>
        ))}

        {naming ? (
          <span className="inline-flex items-center gap-1">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleSave()
                if (e.key === 'Escape') {
                  setNaming(false)
                  setName('')
                }
              }}
              placeholder="Template name…"
              className="text-xs px-2.5 py-1 rounded-full border border-brand bg-surface-hi text-fg w-36 outline-none"
            />
            <button onClick={() => void handleSave()} className="text-xs px-2.5 py-1 rounded-full bg-brand text-white">
              Save
            </button>
            <button
              onClick={() => {
                setNaming(false)
                setName('')
              }}
              className="text-xs px-1.5 py-1 text-fg-faint hover:text-fg-dim"
            >
              Cancel
            </button>
          </span>
        ) : (
          <button onClick={() => setNaming(true)} className={`${chip} text-brand border-brand-tint`}>
            + Save current
          </button>
        )}
      </div>
    </div>
  )
}
