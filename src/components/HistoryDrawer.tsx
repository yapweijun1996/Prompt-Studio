import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../store/db'
import { useStore } from '../store/useStore'
import { togglePin, deleteConversation, clearAllHistory } from '../lib/history'
import type { Conversation } from '../types'

function relativeTime(ts: number): string {
  const min = Math.floor((Date.now() - ts) / 60000)
  if (min < 1) return '刚刚'
  if (min < 60) return `${min} 分钟前`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} 小时前`
  return `${Math.floor(hr / 24)} 天前`
}

function dayBucket(ts: number): 'Today' | 'Yesterday' | 'Earlier' {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  if (ts >= startOfToday) return 'Today'
  if (ts >= startOfToday - 86_400_000) return 'Yesterday'
  return 'Earlier'
}

export function HistoryDrawer({ onClose }: { onClose: () => void }) {
  const restoreConversation = useStore((s) => s.restoreConversation)
  const [query, setQuery] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)

  const all = useLiveQuery(() => db.conversations.orderBy('createdAt').reverse().toArray(), [])

  const q = query.trim().toLowerCase()
  const items = (all ?? []).filter((c) => (q ? c.input.toLowerCase().includes(q) : true))

  const groups: { label: string; rows: Conversation[] }[] = []
  const pinned = items.filter((c) => c.pinned)
  if (pinned.length) groups.push({ label: '已置顶', rows: pinned })
  for (const label of ['Today', 'Yesterday', 'Earlier'] as const) {
    const rows = items.filter((c) => !c.pinned && dayBucket(c.createdAt) === label)
    if (rows.length) {
      const map: Record<'Today' | 'Yesterday' | 'Earlier', string> = {
        Today: '今天',
        Yesterday: '昨天',
        Earlier: '更早',
      }
      groups.push({ label: map[label], rows })
    }
  }

  function handleRestore(c: Conversation) {
    restoreConversation(c)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <aside
        className="relative w-full max-w-sm h-full bg-surface border-l border-line flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="text-lg font-semibold text-fg">历史记录</h2>
          <button
            onClick={onClose}
            className="text-fg-dim hover:text-fg text-2xl leading-none w-9 h-9 flex items-center justify-center"
            aria-label="关闭历史记录"
          >
            &times;
          </button>
        </div>

        <div className="px-5 py-3 border-b border-line">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索历史..."
            className="w-full bg-surface-hi border border-line rounded-lg px-3 py-2 text-sm text-fg placeholder:text-fg-faint outline-none focus:border-brand"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-6 py-14 text-center text-fg-faint text-sm leading-relaxed">
              {all && all.length > 0 ? '未找到匹配记录。' : '还没有历史记录。所有转换会保存在本机。'}
            </div>
          ) : (
            groups.map((g) => (
              <div key={g.label}>
                <div className="px-5 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wide text-fg-faint">
                  {g.label}
                </div>
                {g.rows.map((c) => (
                  <div key={c.id} className="flex items-start gap-1 px-3 py-2 hover:bg-surface-hover rounded-lg mx-2">
                    <button onClick={() => handleRestore(c)} className="flex-1 text-left min-w-0 px-2 py-1">
                      <div className="text-sm text-fg truncate">{c.title}</div>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-fg-faint">
                        <span className="px-1.5 py-0.5 rounded bg-surface-hi text-fg-dim">{c.promptType}</span>
                        <span>{c.provider}</span>
                        <span>·</span>
                        <span>{relativeTime(c.createdAt)}</span>
                      </div>
                    </button>
                    <button
                      onClick={() => togglePin(c.id as number, !c.pinned)}
                      className={`shrink-0 w-9 h-9 flex items-center justify-center text-sm ${
                        c.pinned ? 'text-brand' : 'text-fg-faint hover:text-fg-dim'
                      }`}
                      aria-label={c.pinned ? '取消置顶' : '置顶'}
                      title={c.pinned ? '取消置顶' : '置顶'}
                    >
                      {c.pinned ? '★' : '☆'}
                    </button>
                    <button
                      onClick={() => deleteConversation(c.id as number)}
                      className="shrink-0 w-9 h-9 flex items-center justify-center text-lg text-fg-faint hover:text-danger"
                      aria-label="删除"
                      title="删除"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {all && all.length > 0 && (
          <div className="px-5 py-3 border-t border-line">
            {confirmClear ? (
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    await clearAllHistory()
                    setConfirmClear(false)
                  }}
                  className="flex-1 py-2 rounded-lg bg-danger text-white text-xs font-medium"
                >
                  确认清空全部
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="flex-1 py-2 rounded-lg bg-surface-hi text-fg-dim text-xs"
                >
                  取消
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="w-full py-2 rounded-lg bg-surface-hi hover:bg-surface-hover text-fg-dim text-xs"
              >
                清空历史
              </button>
            )}
          </div>
        )}
      </aside>
    </div>
  )
}
