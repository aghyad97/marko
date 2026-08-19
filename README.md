# Marko

Dev-only UI review overlay for React. Reviewers annotate the live UI; you export their comments as Markdown or JSON. Zero runtime dependencies (only `react` / `react-dom` peers), fully client-side, persists to localStorage — no backend, no third-party scripts, safe for locked-down enterprise environments.

## Install

```bash
npm i -D @marko/review
```

## Use

```tsx
import { Marko } from "@marko/review";

function App() {
  return (
    <>
      <YourApp />
      <Marko />
    </>
  );
}
```

Marko renders nothing in production (`NODE_ENV === "production"`). To control it explicitly:

```tsx
<Marko enabled={import.meta.env.DEV} />
```

## Features

- Bottom-right dock: marker button toggles review mode (`R`), list button opens the notes panel
- Click any element to pin a numbered note; hovering a pin shows the comment in a tooltip, clicking opens the editor
- Everything autosaves as you type (debounced) — popover and panel edits alike
- Overlay side sheet (scrim + slide-in): filter by open/resolved, resolve/reopen, copy per note, inline edit, Copy all as Markdown or JSON
- Clear-all behind a centered destructive confirmation dialog
- Review rail: right-edge minimap tick per note; click to jump
- Hold `Alt`/`Option` to click through to the page while reviewing
- localStorage persistence per pathname — survives refresh, no backend
- Light/dark theming that follows the host app automatically (`theme="host"`, the default)

## Keyboard

| Key | |
|---|---|
| `R` | Toggle review mode |
| `L` | Toggle the notes panel (review mode on) |
| `Enter` | Done — close the note popover (a note left empty is deleted) |
| `Shift+Enter` | New line inside a comment |
| `⌘E` / `Ctrl+E` | Resolve / reopen the open note |
| `⌘⌫` / `Ctrl+⌫` | Delete the open note |
| `Esc` | Close popover → close panel → exit review mode (empty notes are deleted) |
| `Alt` (hold) | Click through to the host page |

## Notes inside modals and overlays

A note is anchored to the element you click. If that element lives inside a modal, drawer, or sheet, the pin renders only while that element is present and visible: close the modal and the pin leaves the page, the note stays in the panel marked "not on screen", and the pin returns when the modal reopens.

## Props

| Prop | Default | |
|---|---|---|
| `enabled` | `NODE_ENV !== "production"` | Master switch; `false` renders nothing |
| `theme` | `"host"` | `"host"` follows the app's `dark`/`light` class or `data-theme` on `<html>`/`<body>` (Tailwind/shadcn convention), falling back to the system setting; `"auto"` follows the system only; `"light"`/`"dark"` force it |
| `storageKey` | `"marko"` | localStorage key prefix (one entry per pathname) |
| `saveDebounceMs` | `400` | Debounce for persisting edits |
| `onChange` | — | Called with the note list after each save |

## Restyling

Marko ships its own styling and every color and size flows through a `--marko-*` CSS custom property on `[data-marko-root]`:

```css
[data-marko-root] {
  --marko-accent: #f0a500;
  --marko-radius: 8px;
  --marko-font: "Your Sans", sans-serif;
}
```

See `src/styles.ts` for the full token list.
