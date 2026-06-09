import { useState } from 'react'
import { useStore } from '../store/useStore'
import type { Provider, EffortLevel, GenerationMode } from '../types'

const PROVIDERS: { value: Provider; label: string }[] = [
  { value: 'default', label: '默认（内置网关）' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'custom', label: '自定义（OpenAI 兼容）' },
]

const EFFORT_LEVELS: { value: EffortLevel; label: string; desc: string }[] = [
  { value: 'low', label: '快速', desc: '速度优先，推理较少' },
  { value: 'medium', label: '平衡', desc: '默认质量与速度平衡' },
  { value: 'high', label: '深入', desc: '更深度的推理' },
  { value: 'xhigh', label: '强深', desc: '最高推理强度（仅 GPT-5.2+ / Gemini Pro）' },
]

const OPENAI_MODELS = ['gpt-5.4-mini', 'o4-mini', 'o3', 'gpt-5.2']
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.5-pro']

const fieldClass =
  'bg-surface-hi border border-line-hi rounded-lg px-3 py-2 text-sm text-fg placeholder:text-fg-faint'
const labelClass = 'text-xs font-medium text-fg-dim uppercase tracking-wide'

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const store = useStore()
  const [showKey, setShowKey] = useState(false)

  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-surface border border-line rounded-2xl w-full max-w-md p-6 flex flex-col gap-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-fg">设置</h2>
          <button onClick={onClose} className="text-fg-dim hover:text-fg text-xl leading-none">&times;</button>
        </div>

        {/* Provider */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>服务商</label>
          <select
            value={store.provider}
            onChange={(e) => store.setProvider(e.target.value as Provider)}
            className={fieldClass}
          >
            {PROVIDERS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>

        {/* Model */}
        {store.provider !== 'default' && (
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>模型</label>
            {store.provider === 'openai' ? (
              <select value={store.model} onChange={(e) => store.setModel(e.target.value)} className={fieldClass}>
                {OPENAI_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            ) : store.provider === 'gemini' ? (
              <select value={store.model} onChange={(e) => store.setModel(e.target.value)} className={fieldClass}>
                {GEMINI_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            ) : (
              <input
                value={store.model}
                onChange={(e) => store.setModel(e.target.value)}
                placeholder="例如：gpt-4o"
                className={fieldClass}
              />
            )}
          </div>
        )}

        {/* Custom endpoint */}
        {store.provider === 'custom' && (
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>端点地址（Base URL）</label>
            <input
              value={store.endpoint}
              onChange={(e) => store.setEndpoint(e.target.value)}
              placeholder="https://your-api.example.com/v1"
              className={fieldClass}
            />
          </div>
        )}

        {/* API Key */}
        {store.provider !== 'default' && (
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>API Key</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={store.apiKey}
                onChange={(e) => store.setApiKey(e.target.value)}
                placeholder="sk-..."
                className={`w-full pr-16 ${fieldClass}`}
              />
              <button
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-fg-dim hover:text-fg"
              >
                {showKey ? '隐藏' : '显示'}
              </button>
            </div>
            <p className="text-[11px] text-fg-faint">仅保存在本机，并进行 XOR 混淆。</p>
          </div>
        )}

        {store.provider === 'default' && (
          <div className="bg-surface-hi rounded-lg px-3 py-2 text-xs text-fg-dim">
            演示密钥（内置）每分钟限制 30 次请求。
          </div>
        )}

        {/* Effort */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>推理强度</label>
          <div className="grid grid-cols-2 gap-2">
            {EFFORT_LEVELS.map((e) => (
              <button
                key={e.value}
                onClick={() => store.setEffort(e.value)}
                className={`text-left px-3 py-2 rounded-lg border text-xs transition-colors ${
                  store.effort === e.value
                    ? 'border-brand bg-brand-tint text-fg'
                    : 'border-line bg-surface-hi text-fg-dim hover:border-line-hi'
                }`}
              >
                <div className="font-medium">{e.label}</div>
                <div className="opacity-70 text-[10px]">{e.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Default mode */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>默认输出风格</label>
          <div className="flex gap-2">
            {(['creative', 'balanced', 'strict'] as GenerationMode[]).map((m) => (
              <button
                key={m}
                onClick={() => store.setMode(m)}
                className={`flex-1 py-1.5 rounded-lg border text-xs capitalize transition-colors ${
                  store.mode === m
                    ? 'border-brand bg-brand-tint text-fg'
                    : 'border-line bg-surface-hi text-fg-dim'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-1 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-sm font-medium transition-colors"
        >
          完成
        </button>
      </div>
    </div>
  )
}
