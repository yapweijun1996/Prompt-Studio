# task.md — Prompt Studio

## Status Legend
- [ ] Pending
- [~] In Progress
- [x] Done
- [!] Blocked

Last updated: 2026-05-22

---

## Phase 0 — Design & Decisions  ✅ COMPLETE

- [x] Write initial DESIGN.md
- [x] Research Gemini thinkingConfig + OpenAI reasoning.effort API
- [x] Document provider adapter interface (docs/providers.md)
- [x] Document PWA setup (docs/pwa.md)
- [x] Decided: **TypeScript**
- [x] Decided: **agrun.js** for LLM transport

---

## Phase 1 — Project Scaffold  ✅ COMPLETE

- [x] Vite + React 19 + TypeScript scaffold (created manually, dir not empty)
- [x] Install deps: tailwindcss v4, zustand, dexie, vite-plugin-pwa, agrun
- [x] Install agrun from GitHub (not on npm registry)
- [x] Configure Tailwind v4 via @tailwindcss/vite (shadcn/ui skipped — custom components)
- [x] Configure vite-plugin-pwa (manifest, workbox NetworkOnly for API)
- [x] Set up .github/workflows/deploy.yml (GitHub Actions → Pages)
- [ ] Generate PWA icons (192, 512, maskable, apple-touch) — **placeholder, user to supply**

---

## Phase 2 — Gateway & XOR Layer  ✅ COMPLETE

- [x] xor.ts — encrypt/decrypt with key "20260515" + localStorage helpers
- [x] Computed encrypted hex for demo gateway key (verified round-trip)
- [x] gateway.ts — Default demo provider (agrun + Responses API)
- [x] openai.ts — direct OpenAI provider (agrun)
- [x] gemini.ts — Gemini thinkingConfig provider (direct fetch)
- [x] custom.ts — OpenAI-compatible passthrough (agrun)
- [x] convert.ts callProvider() — routes to correct adapter
- [x] Map UI effort levels → provider-specific params

---

## Phase 3 — State & Core Logic  ✅ COMPLETE

- [x] Zustand store (input, mode, effort, provider, outputs, loading, rateLimit)
- [x] Dexie schema (templates table) — db.ts
- [x] convert.ts — fires 3 parallel calls via Promise.allSettled
- [x] Per-variant system prompts (Creative / Balanced / Strict × Option 1/2/3)
- [x] Rate limit detection (429 → countdown timer)
- [x] XOR key storage in localStorage ("ps_k")

---

## Phase 3.5 — Bug Fixes (post first run)  ✅ COMPLETE

User hit `result.output is null` on first run. Root cause: agrun does NOT
throw on provider failure — it resolves `{ error, output: null }`.

- [x] **Bug A** — switched `session.run()` → `runtime.run()` (one-shot, no
      session; avoids per-turn memory-extraction LLM call). Added
      `globalMemory: { enabled: false }`.
- [x] **Bug B** — `runAgrun()` helper now checks `result.error` and throws a
      proper Error with provider HTTP status, instead of crashing on
      `result.output.text` when output is null.
- [x] **Bug C** — rate-limit `throw` inside Promise.allSettled task never
      propagated; `convertPrompt()` now returns `{ rateLimited }`.

---

## Phase 4 — UI Components  ✅ COMPLETE

- [x] App layout (header / input / output panels)
- [x] Header — logo, settings icon, provider badge
- [x] PromptTypeSelect (in InputPanel)
- [x] PromptTextarea (in InputPanel)
- [x] GenerationModeSelect — Creative / Balanced / Strict
- [x] EffortSelector — Quick / Balanced / Thorough / Deep (in SettingsModal)
- [x] ConvertButton — loading + disabled state
- [x] OutputList + OutputCard (label, text, copy, select, spinner, error)
- [x] SettingsModal (provider, model, API key, effort, default mode)
- [x] OfflineBanner
- [x] RateLimitCountdown
- [x] PwaUpdateBanner
- [ ] TemplateManager (CRUD via Dexie) — **db.ts ready, UI not built yet**
- [ ] PWA install button in Header — **not built yet**

---

## Phase 5 — Deploy & Verify  [~] IN PROGRESS

- [x] Set VITE_BASE_PATH in GitHub Actions workflow
- [x] TypeScript build passes (0 errors)
- [x] Production build passes (manual chunks split)
- [ ] **Live test Default provider** — user hit error; bug fixes applied,
      awaiting retry to see the real agrun error message
- [ ] Verify PWA manifest + service worker on GitHub Pages URL
- [ ] Lighthouse PWA audit (score ≥ 90)
- [ ] Test OpenAI / Gemini / Custom providers end-to-end
- [ ] Test offline mode
- [ ] Test rate limit UI (429 → countdown)
- [ ] Enable GitHub Pages (Settings → Pages → Source: GitHub Actions)

---

## Open Items (not yet built)

1. **PWA icons** — `public/pwa-192x192.png`, `pwa-512x512.png`,
   `apple-touch-icon.png`, `favicon.ico` are referenced but do not exist.
   Build succeeds but install/icons will be broken until supplied.
2. **TemplateManager UI** — Dexie schema (`db.ts`) is ready; the prompt
   template CRUD panel is not built.
3. **PWA install button** — `beforeinstallprompt` capture not wired.

---

## Known Risks

| Risk | Status / Mitigation |
|---|---|
| agrun runs planner + finalize per `run()` → ~2 gateway calls per variant | 3 variants ≈ 6 gateway calls per Convert. With 30 req/min limit → ~5 Converts/min, not 10. RateLimitCountdown handles 429. |
| XOR is reversible — demo key extractable | Accepted: rate-limited demo key (same as GOT project) |
| Gemini "Deep" budget 32768 exceeds Flash max (24576) | Fixed: `clampBudget()` in gemini.ts caps per model |
| PWA icons missing | Build OK; user must supply real icons |
| PWA base path on GitHub Pages | VITE_BASE_PATH=/Prompt-Studio/ set in CI |
