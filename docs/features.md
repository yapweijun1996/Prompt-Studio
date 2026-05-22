# Features

User-facing features beyond the core "one prompt → 3 outputs" flow.
All are **local-first** — nothing is sent to a server except the LLM calls.

## Generation History

Every successful Convert is auto-saved to IndexedDB (Dexie `conversations`
table). Open the **History** drawer from the clock icon in the Header.

- Rows are grouped **Pinned / Today / Yesterday / Earlier**.
- A search box filters by the input text.
- **Tap a row** to restore that run — input box + the 3 output cards.
- **Pin** (★) keeps a row at the top and exempt from pruning.
- **Delete** removes one row; **Clear all history** is a two-step confirm.
- The log is capped at ~200 rows; the oldest *unpinned* rows are pruned.

Code: `src/lib/history.ts`, `src/components/HistoryDrawer.tsx`,
`store.restoreConversation()`.

## Templates

A **TemplateBar** above the input applies or saves a named preset of the
settings you re-type each session: `{ promptType, mode, effort }`.

- 2 built-in starters: *Polished email*, *Brainstorm ideas*.
- **+ Save current** stores the current settings under a name.
- User templates can be deleted; starters cannot.
- Backed by the Dexie `templates` table.

Code: `src/lib/templates.ts`, `src/components/TemplateBar.tsx`.

## Share a Result

Share a whole run with **no backend**. The **Copy share link** button (above
the output cards) encodes the run — input, settings, and all outputs — into a
base64url `#c=` URL hash.

Opening such a link rehydrates the run into a read-only-style view and shows a
"Loaded from a shared link" banner, then strips the hash. The link contains
the prompt and outputs in plain (encoded) form — anyone with it can read them.

Code: `src/lib/share.ts` (`encodeShare` / `decodeShare` / `buildShareUrl`).

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl` / `⌘` + `Enter` | Convert (works from the textarea) |
| `1` / `2` / `3` | Select / deselect output variant 1–3 |

Code: a `keydown` listener in `src/components/InputPanel.tsx`.

## Installable PWA

When the browser reports the app is installable, an **Install** button appears
in the Header (`beforeinstallprompt`). The manifest ships `categories` and
wide/narrow `screenshots` so Chrome shows its richer install dialog. See
[`pwa.md`](./pwa.md).
