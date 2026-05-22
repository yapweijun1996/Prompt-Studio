# DESIGN.md

## Project Overview
This project is a web-based prompt conversion system built with **Vite + React + TypeScript**. It lets users enter a prompt, click **Convert**, and then review **up to 3 generated output options** so they can compare and select the best one.

## Goals
- Provide a fast, clean, and easy-to-use web interface
- Let users convert one input into up to 3 selectable outputs
- Support multiple LLM providers and model settings
- Make it easy to copy, select, and reuse a chosen output
- Keep the app lightweight and local-first where possible
- Ship as a **PWA** (Progressive Web App) for offline use and installability
- Deploy via **GitHub Actions** to GitHub Pages

## Non-Goals
- Not intended to be a full enterprise workflow platform
- Not intended to store large amounts of user data on the server by default
- Not intended to replace a dedicated prompt management backend
- Not intended to require complex onboarding

## Resolved Decisions
| # | Question | Decision |
|---|---|---|
| 1 | JavaScript or TypeScript? | **TypeScript** |
| 2 | agrun.js or plain `Promise.all` fetch? | **agrun.js** (the user's own runtime). agrun is an agent runtime; Prompt Studio runs a one-shot turn and uses an `onInvalidPlannerOutput` hook to coerce the planner's plain-text reply into a final answer. Gemini uses a direct `fetch`. The 3 variant calls run via `Promise.allSettled`. |

---

## Core User Flow
1. User opens the app (installed as PWA or via browser)
2. User selects a prompt type or mode
3. User enters source text in a textarea
4. User selects generation mode (Creative / Balanced / Strict)
5. User clicks **Convert**
6. The app fires **3 parallel API calls** (Promise.all) with different system prompts per mode variant
7. App shows up to **3 output cards** as results arrive
8. User reviews, copies, or selects one output as final

## Feature Requirements

### Input
- Prompt type selector / combobox
- Main textarea for user input
- Convert button
- Generation mode selector: Creative / Balanced / Strict
- Thinking/effort intensity selector (maps to provider-specific config)

### Output
- Show **0–3** generated results after conversion
- Each output card includes:
  - Title / version label (e.g. "Option 1 — Creative")
  - Generated text
  - Copy button
  - Select button
- Highlight the selected output
- Gracefully show only the results returned if fewer than 3

### Error & Edge Cases
- API failure: show error banner per card, allow retry
- Rate limit (gateway: 30 req/min): show "Rate limited, wait Ns" with countdown
- Empty output: show "No content returned" placeholder
- Network offline: show offline banner (PWA handles caching of app shell)
- Invalid / expired API key: show inline key error with link to settings

### Settings
- LLM provider selection (Default Demo / OpenAI / Gemini / Custom)
- Model name or preset
- API key input (XOR-obfuscated in localStorage; plaintext never stored)
- Default mode / style preference
- Thinking/effort intensity per provider
- Prompt template management

---

## API Key Security

API keys are XOR-obfuscated before being stored in localStorage.

```
XOR cipher key: "20260515"
Algorithm: for each char at index i → charCode XOR key[i % key.length]
Storage: hex string in localStorage key "ps_k"
```

**Important**: XOR is obfuscation, not encryption. Anyone with DevTools can extract it. This is acceptable because:
- The default demo key is a rate-limited gateway key (30 req/min)
- User-supplied API keys are their own responsibility
- This matches the GOT project's precedent for the same gateway

### Default Demo Provider
- **Endpoint**: `https://gpt.yapweijun1996.com/v1/responses`
- **Model**: `gpt-5.4-mini`
- **Format**: OpenAI Responses API (`input[]`, `reasoning.effort`)
- **Demo key**: XOR-encrypted hex stored in source (computed at build time from `gw_524fa12f91c74c0aa21d73fbaa7b97a27a7db3b5a6b33708`)
- **Rate limit**: 30 requests/minute (sliding window) — 10 conversions/min max at 3 calls each
- Users see "Demo key (built-in)" badge; key input is hidden

---

## Multi-Provider Support

See `docs/providers.md` for full API reference per provider.

| Provider | Format | Thinking/Effort Control |
|---|---|---|
| Default (GPT Gateway) | OpenAI Responses API | `reasoning.effort`: low / medium / high |
| OpenAI (direct) | OpenAI Responses API | `reasoning.effort`: low / medium / high / xhigh |
| Gemini | Google Generative AI | `thinkingConfig.thinkingBudget`: 0–32768, -1=dynamic |
| Custom | OpenAI-compatible | Passthrough `reasoning.effort` |

### 3 Parallel API Calls Strategy
After Convert, the app fires 3 concurrent `fetch()` calls:
- **Option 1 (Direct/Safe)**: Low effort, minimal thinking budget, direct system prompt
- **Option 2 (Structured)**: Medium effort, moderate thinking budget, structured output prompt
- **Option 3 (Concise/Optimized)**: High effort, high thinking budget, optimization-focused prompt

All 3 calls use `Promise.allSettled()` so a single failure doesn't block the others.

---

## PWA Requirements

Standard: **Web App Manifest + Service Worker via `vite-plugin-pwa`**

- **Install prompt**: Shown after first visit
- **Offline**: App shell cached; LLM calls gracefully fail with offline message
- **Manifest**: name, short_name, icons (192×192, 512×512, maskable), theme_color, background_color, display: standalone
- **Service worker strategy**: `generateSW` (Workbox) for app shell; network-first for API calls
- **Update flow**: Prompt user to reload when new version available

Plugin: `vite-plugin-pwa` ≥ 0.17 (requires Vite 5, Node 16+)

---

## GitHub Actions Deploy

Deploy to **GitHub Pages** on every push to `main`.

Workflow steps:
1. `npm ci`
2. `npm run build` (Vite production build, base path set to repo name)
3. Upload `dist/` as GitHub Pages artifact
4. Deploy via `actions/deploy-pages`

Base path: `VITE_BASE_PATH` env var set to `/<repo-name>/` in CI.

---

## UI Layout

### 1. Header
- App name / logo
- Settings icon
- Provider status badge (Demo key / Connected / Error)
- PWA install button (when prompt available)

### 2. Input Panel
- Prompt type combobox
- Textarea for the source prompt
- Generation mode selector (Creative / Balanced / Strict)
- Thinking/effort intensity slider or selector
- Convert button (disabled while generating)

### 3. Output Panel
- Display up to 3 result cards in a grid or stacked layout
- Each card:
  - Version label + mode tag
  - Generated output text
  - Copy action
  - Select action
  - Per-card loading spinner / error state
- Selected output visually emphasized

### 4. Settings Panel / Modal
- Provider selection
- Model selection
- API key (XOR-stored) with show/hide toggle
- Thinking/effort defaults per provider
- Default behavior settings
- Preset prompt templates
- Storage preferences
- PWA update prompt if pending

---

## State Management

Use **Zustand** for global state:

```ts
{
  input: string
  promptType: string
  mode: 'creative' | 'balanced' | 'strict'
  effortLevel: 'low' | 'medium' | 'high'
  provider: 'default' | 'openai' | 'gemini' | 'custom'
  model: string
  apiKey: string          // plaintext in memory only
  loading: boolean
  outputs: OutputCard[]   // up to 3
  selectedIndex: number | null
  settings: Settings
}
```

---

## Data Persistence

| Data | Storage | Notes |
|---|---|---|
| API key | localStorage (XOR hex) | Never plaintext |
| Provider / model choice | localStorage | Plain JSON |
| Default mode/effort | localStorage | Plain JSON |
| Saved templates | IndexedDB via Dexie | Structured data |
| Selected output (session) | Memory (Zustand) | Not persisted |

---

## Recommended Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Build | **Vite 5** | Fast HMR, ESM output |
| UI | **React 19 + TypeScript** | |
| Styling | **Tailwind CSS v4** (semantic tokens) | |
| State | **Zustand** | Simple global store |
| LLM Transport | **agrun.js** | One-shot turn; Gemini uses direct fetch |
| IndexedDB | **Dexie** | Typed IDB wrapper |
| PWA | **vite-plugin-pwa ≥ 0.17** | Workbox generateSW |
| Deploy | **GitHub Actions → GitHub Pages** | |

---

## Component Structure

- `AppShell` — layout root, PWA update banner
- `Header` — logo, settings icon, provider badge, install button
- `ProviderSelector` — dropdown + status
- `PromptTypeSelect` — combobox
- `PromptTextarea` — main input
- `GenerationModeSelect` — Creative / Balanced / Strict
- `EffortSelector` — maps to provider reasoning config
- `ConvertButton` — disabled + loading state
- `OutputList` — grid of up to 3 cards
- `OutputCard` — label, text, copy, select, loading/error state
- `SelectedOutputPreview` — highlighted chosen output
- `SettingsPanel` — modal or side panel
- `TemplateManager` — saved prompts CRUD
- `OfflineBanner` — shown when navigator.onLine = false
- `RateLimitCountdown` — shown on 429 response

---

## Accessibility and UX Notes

- Clear labels for all inputs
- Keyboard navigation for all controls
- Visible focus states
- Sufficient color contrast (WCAG AA)
- Loading feedback during conversion (per-card spinners)
- Disable Convert button while generating
- Copy/select actions easy to understand
- Output cards scannable and readable
- Rate limit countdown visible
- Offline state clearly communicated

---

## Future Enhancements

Shipped 2026-05-22 (see `task.md`): prompt history with pin/favorite, prompt
templates, local-first share links, keyboard shortcuts, installable PWA.

Still open:
- Export selected outputs
- Compare outputs in a split-view mode
- Markdown preview for generated outputs
- ⌘K command palette
- Independent judge model for output ranking
- Out of scope: streaming responses, server-side sharing, accounts/sync

---

## Summary
A **Vite + React** PWA that accepts user input, converts it via 3 parallel LLM calls (OpenAI Responses API / Gemini thinking API), and returns **up to 3 selectable outputs**. API keys are XOR-obfuscated in localStorage. A built-in demo key (rate-limited gateway) works out of the box. Deployed to GitHub Pages via GitHub Actions.
