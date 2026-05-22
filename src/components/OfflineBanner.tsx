import { useState, useEffect } from 'react'

export function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const on = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  if (!offline) return null
  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-amber-600 text-white text-sm text-center py-1.5 px-4">
      You are offline — app shell available but AI calls will fail.
    </div>
  )
}
