import { useRegisterSW } from 'virtual:pwa-register/react'

export function PwaUpdateBanner() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()

  if (!needRefresh) return null
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-surface-hi border border-line-hi rounded-xl px-5 py-3 flex items-center gap-4 shadow-2xl text-sm">
      <span className="text-fg-muted">New version available</span>
      <button
        onClick={() => updateServiceWorker(true)}
        className="bg-brand text-white px-3 py-1 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
      >
        Reload
      </button>
    </div>
  )
}
