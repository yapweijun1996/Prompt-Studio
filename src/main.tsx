import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Request persistent storage so the browser does not auto-clear IndexedDB
// (history, templates) under storage pressure. Fire-and-forget — the PWA
// functions without it; this is a best-effort durability hint.
if ('storage' in navigator && 'persist' in navigator.storage) {
  void navigator.storage.persist().then((granted) => {
    if (!granted) console.debug('[pwa] storage.persist() denied — data may be evicted under pressure')
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
