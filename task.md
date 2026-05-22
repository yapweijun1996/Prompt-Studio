# task.md — Prompt Studio

## Status Legend
- [ ] Pending  · [~] In Progress  · [x] Done  · [!] Blocked

Last updated: 2026-05-22
Live: https://yapweijun1996.github.io/Prompt-Studio/

---

## Phases 0–6 — Initial build  ✅

- [x] Phase 0 — Design, provider research, docs (DESIGN.md, docs/)
- [x] Phase 1 — Vite 6 + React 19 + TS scaffold, vite-plugin-pwa, GitHub Actions
- [x] Phase 2 — XOR key storage, gateway / OpenAI / Gemini / Custom adapters
- [x] Phase 3 — Zustand store, Dexie, 3 parallel calls, rate-limit detection
- [x] Phase 4 — Header, InputPanel, OutputList / OutputCard, SettingsModal
- [x] Phase 5 — Light / dark theme (Tailwind v4 semantic tokens)
- [x] Phase 6 — GitHub Pages deploy, PWA manifest + service worker

---

## Bug Fixes

- [x] **agrun null output** — `runAgrun()` surfaces `result.error` instead of
  crashing on `result.output.text`
- [x] **session.run overhead** — switched to `runtime.run()` (one-shot)
- [x] **rate-limit not firing** — `convertPrompt()` returns `{ rateLimited }`
- [x] **Gemini budget overflow** — `clampBudget()` caps per model
- [x] **provider switch broken** — `setProvider()` now resets the model
- [x] **promptType dead control** — Prompt Type was collected but never sent to
  the LLM; now wired into the system prompt (71a1473)
- [x] **agrun planner-envelope conflict** — the hardened output contract made
  agrun's planner emit plain text, breaking envelope parsing → every Convert
  errored with "approval required". `onInvalidPlannerOutput` coerces the
  plain-text reply into a `final` decision, skipping the repair cascade (65e2ff9)

---

## Prompt & Context Engineering

- [x] Restructured `convert.ts` per the prompt/context-engineering skills:
  named-tag policy blocks, system/turn split, injected-context firewall
  (`<draft>` fencing), output contract with IMPORTANT/ABSOLUTE severity
  ladder (71a1473)

---

## Shipped — UX & Capability Roadmap  (2026-05-22)

Researched (web + KB-MCP) and shipped on branch `polish-icons-and-theme`,
ordered by end-user pain. One commit per feature.

- [x] **P1-A · Generation History** (565ee13) — every Convert auto-saved to a
  Dexie `conversations` table; History drawer with day grouping, search, pin,
  delete, two-step clear-all; tap a row to restore input + outputs.
- [x] **P1-B · Mobile-First Layout** (2e3cad6) — output cards stack on mobile,
  full-width sticky Convert bar, safe-area insets, no horizontal scroll.
- [x] **P1-C · Installable PWA** (1f1b006) — `beforeinstallprompt` capture,
  custom Install button, manifest `categories` + wide/narrow `screenshots`.
- [x] **P2-A · Template Manager** (cfef7ea) — TemplateBar to apply or save
  named presets of `{promptType, mode, effort}`; 2 built-in starters.
- [x] **P2-B · Share a Result** (4a75a90) — local-first `#c=` base64url hash;
  "Copy share link"; on load, rehydrates the run and shows a banner.
- [x] **P3 · Desktop Shortcuts** (5056ee5) — Ctrl/Cmd+Enter converts,
  1 / 2 / 3 select a variant.
- [x] **Test suite** (a7472db) — Vitest, 14 unit tests (xor, share, convert
  prompt-builder, gemini clampBudget); run with `npm test`.

### Deferred this round (noted, not built)
- iOS Share→Add-to-Home-Screen instruction card (P1-C)
- ⌘K command palette, two-pane ≥1280px layout, per-card regenerate (P3)
- `share_target` manifest entry (P2-B)

### Explicitly out of scope
No server-side share, no accounts / cloud sync, no chat threads / branching,
no streaming UI — Prompt Studio is a local-first single-shot tool.

---

## Open Items

- [!] **Live provider E2E** — Default (demo gateway) verified live; OpenAI /
  Gemini / Custom need the user's own API key to verify end-to-end. Blocked
  on credentials.

---

## Known Risks

| Risk | Status |
|---|---|
| agrun runs a planner call per turn | `onInvalidPlannerOutput` collapses it to ~1 LLM call per variant; RateLimitCountdown handles 429 |
| XOR is reversible — demo key extractable | Accepted: rate-limited demo key |
| Demo key only works for Default provider | OpenAI/Gemini/Custom need the user's own key (Settings) |
| Share-link URL length on very large runs | Acceptable for typical rewrites; not yet truncated/warned |
