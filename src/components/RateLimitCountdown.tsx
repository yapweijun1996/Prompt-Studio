import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'

export function RateLimitCountdown() {
  const rateLimitUntil = useStore((s) => s.rateLimitUntil)
  const setRateLimitUntil = useStore((s) => s.setRateLimitUntil)
  const [secs, setSecs] = useState(0)

  useEffect(() => {
    if (!rateLimitUntil) return
    const tick = () => {
      const remaining = Math.ceil((rateLimitUntil - Date.now()) / 1000)
      if (remaining <= 0) { setRateLimitUntil(null); return }
      setSecs(remaining)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [rateLimitUntil, setRateLimitUntil])

  if (!rateLimitUntil) return null
  return (
    <div className="text-center text-amber-400 text-sm py-2">
      Rate limited — retry in {secs}s
    </div>
  )
}
