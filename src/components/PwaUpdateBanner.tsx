import { useEffect, useRef, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

const AUTO_RELOAD_SECONDS = 8

export function PwaUpdateBanner() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()
  const [countdown, setCountdown] = useState(AUTO_RELOAD_SECONDS)
  const didReload = useRef(false)

  useEffect(() => {
    if (!needRefresh || didReload.current) return

    let timer = AUTO_RELOAD_SECONDS
    setCountdown(timer)

    const interval = setInterval(() => {
      timer -= 1
      if (timer <= 0) {
        didReload.current = true
        clearInterval(interval)
        void updateServiceWorker(true)
        return
      }
      setCountdown(timer)
    }, 1000)

    return () => clearInterval(interval)
  }, [needRefresh, updateServiceWorker])

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-surface-hi border border-line-hi rounded-xl px-5 py-3 flex items-center gap-4 shadow-2xl text-sm">
      <span className="text-fg-muted">发现新版本，{countdown}s 后自动重载</span>
      <button
        onClick={() => {
          didReload.current = true
          void updateServiceWorker(true)
        }}
        className="bg-brand text-white px-3 py-1 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
      >
        立即重载
      </button>
    </div>
  )
}
