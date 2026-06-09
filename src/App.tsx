import { useEffect, useState } from 'react'
import { Header } from './components/Header'
import { InputPanel } from './components/InputPanel'
import { OutputList } from './components/OutputList'
import { OfflineBanner } from './components/OfflineBanner'
import { PwaUpdateBanner } from './components/PwaUpdateBanner'
import { RateLimitCountdown } from './components/RateLimitCountdown'
import { useStore } from './store/useStore'
import { decodeShare } from './lib/share'

export default function App() {
  const [sharedNotice, setSharedNotice] = useState(false)

  // If opened via a `#c=` share link, rehydrate the run, then strip the hash.
  useEffect(() => {
    const match = location.hash.match(/^#c=(.+)$/)
    if (!match) return
    const payload = decodeShare(match[1])
    if (payload) {
      useStore.getState().restoreConversation(payload)
      setSharedNotice(true)
    }
    history.replaceState(null, '', location.pathname + location.search)
  }, [])

  return (
    <>
      <OfflineBanner />
      <PwaUpdateBanner />
      {sharedNotice && (
        <div className="bg-brand-tint text-brand text-sm px-4 py-2 flex items-center justify-between gap-3">
          <span>已从分享链接恢复：下方内容为他人分享的提示词和结果，仅供参考。</span>
          <button
            onClick={() => setSharedNotice(false)}
            className="shrink-0 text-lg leading-none opacity-70 hover:opacity-100"
            aria-label="关闭"
          >
            &times;
          </button>
        </div>
      )}
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 flex flex-col gap-8">
          <InputPanel />
          <RateLimitCountdown />
          <OutputList />
        </main>
      </div>
    </>
  )
}
