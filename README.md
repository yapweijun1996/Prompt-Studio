# Prompt Studio

A fast, local-first web app that converts one prompt into **up to 3 selectable AI-generated options** so you can compare and pick the best one.

**🔗 Live demo: https://yapweijun1996.github.io/Prompt-Studio/**

---

## Features

- **One input → 3 outputs** — fires 3 parallel LLM calls (`Promise.allSettled`) with Direct / Structured / Concise variants
- **Multiple providers** — Default demo gateway, OpenAI, Gemini, or any OpenAI-compatible endpoint
- **Reasoning control** — Quick / Balanced / Thorough / Deep, mapped to each provider's effort/thinking API
- **Generation modes** — Creative / Balanced / Strict
- **Generation history** — every run auto-saved locally; browse, search, pin, restore
- **Templates** — save and reapply named presets of your settings
- **Share** — copy a local-first link that rehydrates the whole run (no server)
- **Keyboard shortcuts** — ⌘/Ctrl+Enter to convert, 1/2/3 to pick a variant
- **Light & dark theme** — system-aware, with a manual toggle
- **PWA** — installable (custom Install button), offline app shell, auto-update
- **Local-first** — settings in localStorage (API keys XOR-obfuscated), history & templates in IndexedDB
- **Built-in demo key** — works out of the box, no signup (rate-limited)

## Tech Stack

| Layer | Choice |
|---|---|
| Build | Vite 6 |
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS v4 (semantic-token theming) |
| State | Zustand |
| Storage | Dexie (IndexedDB) + localStorage |
| LLM transport | [agrun.js](https://github.com/yapweijun1996/Agent-Runtime-JavaScript) |
| PWA | vite-plugin-pwa (Workbox) |
| Deploy | GitHub Actions → GitHub Pages |

## Getting Started

```bash
npm install
npm run dev      # dev server
npm run build    # type-check + production build
npm run preview  # preview the build
npm test         # run the Vitest unit suite
```

> Requires Node 18+. `npm install` pulls agrun.js directly from GitHub (not on the npm registry).

## Providers

| Provider | Needs a key? | Reasoning control |
|---|---|---|
| **Default (Demo Gateway)** | No — built-in demo key | `reasoning.effort` |
| **OpenAI** | Yes (your key) | `reasoning.effort` (low/medium/high/xhigh) |
| **Gemini** | Yes (your key) | `thinkingConfig.thinkingBudget` |
| **Custom** | Yes | OpenAI-compatible passthrough |

The demo key only works for the **Default** provider. For OpenAI / Gemini / Custom, enter your own key in Settings — it is stored XOR-obfuscated in localStorage.

See [`docs/providers.md`](docs/providers.md) for the full API reference.

## Theme

System-aware on first load (`prefers-color-scheme`), with a header toggle that persists to localStorage. See [`docs/theme.md`](docs/theme.md).

## Deploy

Push to `main` → GitHub Actions builds and deploys to GitHub Pages. The workflow sets `VITE_BASE_PATH=/Prompt-Studio/`. Enable Pages once: **Settings → Pages → Source: GitHub Actions**.

## Project Structure

```
src/
  components/        UI components (Header, InputPanel, OutputCard,
                     HistoryDrawer, TemplateBar, …)
  hooks/             usePwaInstall — beforeinstallprompt capture
  lib/
    convert.ts       3-parallel-call orchestration + prompt builder
    history.ts       save / prune / pin / clear conversation history
    templates.ts     template presets + Dexie helpers
    share.ts         encode/decode a run to a #c= URL hash
    xor.ts           API-key XOR obfuscation
    providers/       per-provider adapters (gateway, openai, gemini, custom)
    *.test.ts        Vitest unit tests
  store/
    useStore.ts      Zustand global state
    db.ts            Dexie schema (templates + conversations)
  types/             shared types + agrun type declarations
docs/                providers.md, pwa.md, theme.md, features.md
scripts/gen-icons.mjs  generates PWA icons from scratch
```

## Documentation

- [`DESIGN.md`](DESIGN.md) — original design spec
- [`task.md`](task.md) — build roadmap and current status
- [`docs/features.md`](docs/features.md) — history, templates, share, shortcuts
- [`docs/providers.md`](docs/providers.md) — provider API reference
- [`docs/pwa.md`](docs/pwa.md) — PWA configuration
- [`docs/theme.md`](docs/theme.md) — theming system
