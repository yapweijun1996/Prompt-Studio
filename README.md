# Prompt Studio

A fast, local-first web app that converts one prompt into **up to 3 selectable AI-generated options** so you can compare and pick the best one.

**🔗 Live demo: https://yapweijun1996.github.io/Prompt-Studio/**

---

## Features

- **One input → 3 outputs** — fires 3 parallel LLM calls (`Promise.allSettled`) with Direct / Structured / Concise variants
- **Multiple providers** — Default demo gateway, OpenAI, Gemini, or any OpenAI-compatible endpoint
- **Reasoning control** — Quick / Balanced / Thorough / Deep, mapped to each provider's effort/thinking API
- **Generation modes** — Creative / Balanced / Strict
- **Light & dark theme** — system-aware, with a manual toggle
- **PWA** — installable, offline app shell, auto-update
- **Local-first** — settings in localStorage (API keys XOR-obfuscated), templates in IndexedDB
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
  components/        UI components (Header, InputPanel, OutputCard, …)
  lib/
    convert.ts       3-parallel-call orchestration
    xor.ts           API-key XOR obfuscation
    providers/       per-provider adapters (gateway, openai, gemini, custom)
  store/
    useStore.ts      Zustand global state
    db.ts            Dexie schema
  types/             shared types + agrun type declarations
docs/                providers.md, pwa.md, theme.md
scripts/gen-icons.mjs  generates PWA icons from scratch
```

## Documentation

- [`DESIGN.md`](DESIGN.md) — original design spec
- [`task.md`](task.md) — build roadmap and current status
- [`docs/providers.md`](docs/providers.md) — provider API reference
- [`docs/pwa.md`](docs/pwa.md) — PWA configuration
- [`docs/theme.md`](docs/theme.md) — theming system
