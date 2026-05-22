# PWA Configuration

## Plugin

`vite-plugin-pwa` ≥ 0.17 (requires Vite 5, Node 16+)

```bash
npm install -D vite-plugin-pwa
```

## vite.config Setup

```ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Prompt Studio',
        short_name: 'PromptStudio',
        description: 'Convert prompts into up to 3 AI-generated options',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/gpt\.yapweijun1996\.com\/.*/,
            handler: 'NetworkOnly'
          },
          {
            urlPattern: /^https:\/\/.*\.googleapis\.com\/.*/,
            handler: 'NetworkOnly'
          },
          {
            urlPattern: /^https:\/\/api\.openai\.com\/.*/,
            handler: 'NetworkOnly'
          }
        ]
      }
    })
  ]
})
```

## Required Icons

Place in `public/`:
- `pwa-192x192.png` — standard icon
- `pwa-512x512.png` — large icon + maskable
- `apple-touch-icon.png` — 180×180 for iOS
- `mask-icon.svg` — Safari pinned tab

## Update Flow

With `registerType: 'autoUpdate'`, the service worker updates automatically on new deploy. Show a banner to prompt the user to reload:

```ts
import { useRegisterSW } from 'virtual:pwa-register/react'

function App() {
  const { needRefresh, updateServiceWorker } = useRegisterSW()
  return needRefresh[0] ? (
    <div>New version available — <button onClick={() => updateServiceWorker(true)}>Reload</button></div>
  ) : null
}
```

## Offline Behavior

- **App shell**: Fully cached — loads offline
- **LLM API calls**: `NetworkOnly` — fail gracefully with offline message
- **Settings/templates**: Loaded from localStorage/IndexedDB — available offline
- Show `OfflineBanner` when `navigator.onLine === false`

## GitHub Pages Base Path

When deployed to `https://user.github.io/Prompt-Studio/`, set:

```ts
// vite.config.ts
base: process.env.VITE_BASE_PATH || '/'

// manifest start_url and scope must match
start_url: process.env.VITE_BASE_PATH || '/'
scope: process.env.VITE_BASE_PATH || '/'
```

Set `VITE_BASE_PATH=/Prompt-Studio/` in GitHub Actions.
