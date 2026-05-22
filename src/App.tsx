import { Header } from './components/Header'
import { InputPanel } from './components/InputPanel'
import { OutputList } from './components/OutputList'
import { OfflineBanner } from './components/OfflineBanner'
import { PwaUpdateBanner } from './components/PwaUpdateBanner'
import { RateLimitCountdown } from './components/RateLimitCountdown'

export default function App() {
  return (
    <>
      <OfflineBanner />
      <PwaUpdateBanner />
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
