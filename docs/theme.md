# Theming

Prompt Studio supports light and dark themes via Tailwind CSS v4 semantic tokens.

## How it works

Tailwind v4 dropped the `darkMode: 'class'` config option — theming is CSS-first.

### 1. Semantic tokens (`src/index.css`)

Utilities reference a CSS variable; the variable's value switches per theme.

```css
@custom-variant dark (&:where(.dark, .dark *));

@theme inline {
  --color-canvas: var(--c-canvas);
  --color-surface: var(--c-surface);
  --color-fg: var(--c-fg);
  /* … */
}

:root  { color-scheme: light; --c-canvas: #f8fafc; --c-fg: #0f172a; /* … */ }
.dark  { color-scheme: dark;  --c-canvas: #020617; --c-fg: #f1f5f9; /* … */ }
```

`@theme inline` makes each utility emit `var(--color-x)` rather than a baked
value, so redefining `--c-x` under `.dark` switches the whole app.

### Token reference

| Token | Role |
|---|---|
| `canvas` | App background |
| `surface` | Cards, panels, modals |
| `surface-hi` | Inputs, buttons, badges |
| `surface-hover` | Hover state |
| `line` / `line-hi` | Borders |
| `fg` / `fg-muted` / `fg-dim` / `fg-faint` | Text, four emphasis levels |
| `brand` / `brand-hover` / `brand-tint` | Brand indigo (same in both themes) |
| `danger` | Error text |

Components use plain utilities: `bg-surface`, `text-fg-dim`, `border-line`.
No `dark:` variant prefixes are needed — the tokens switch themselves.

### 2. No-flash script (`index.html`)

An inline script in `<head>` applies the `.dark` class **before paint**, so
there is no flash of the wrong theme:

```js
var t = localStorage.getItem('ps_theme');
if (t !== 'light' && t !== 'dark')
  t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
document.documentElement.classList.toggle('dark', t === 'dark');
```

### 3. State + toggle (`src/store/useStore.ts`)

- `getInitialTheme()` — reads `localStorage['ps_theme']`, falls back to
  `prefers-color-scheme`
- `toggleTheme()` — flips the theme, toggles the `.dark` class on
  `<html>`, persists to localStorage
- `ThemeToggle` component renders a sun/moon button in the header

## Adding a new color

1. Add `--color-x: var(--c-x)` to the `@theme inline` block
2. Add `--c-x` values under both `:root` and `.dark`
3. Use `bg-x` / `text-x` / `border-x` in components
