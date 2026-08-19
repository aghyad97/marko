/**
 * "host": follow the host app's theme — a `dark`/`light` class or
 * `data-theme` attribute on <html> (or <body>), the Tailwind/shadcn
 * convention — falling back to prefers-color-scheme when neither is set.
 * "auto": follow prefers-color-scheme only.
 */
export type MarkoTheme = "light" | "dark" | "auto" | "host";

export interface MarkoNote {
  id: string;
  /** 1-based display number, stable per page */
  num: number;
  /** CSS selector path to the anchor element at creation time */
  selector: string;
  /** Human-readable label for the anchor (tag#id, heading text, etc.) */
  label: string;
  /** Click offset inside the anchor element, as a fraction of its box (0..1) */
  fx: number;
  fy: number;
  /** Absolute page coordinates fallback, used when the selector no longer resolves */
  pageX: number;
  pageY: number;
  text: string;
  createdAt: number;
  updatedAt: number;
  resolved: boolean;
}

export interface MarkoPageState {
  notes: MarkoNote[];
  /** Monotonic counter so numbers are never reused after deletion */
  nextNum: number;
}

export interface MarkoProps {
  /**
   * Master switch. When false, Marko renders nothing and installs nothing.
   * Defaults to true only outside production (NODE_ENV !== "production").
   */
  enabled?: boolean;
  /** Color scheme for Marko's own chrome. Defaults to "host". */
  theme?: MarkoTheme;
  /** localStorage key prefix. One entry is written per pathname. */
  storageKey?: string;
  /** Debounce for persisting text edits, in ms. */
  saveDebounceMs?: number;
  /** Called whenever the note set changes (after debounce). */
  onChange?: (notes: MarkoNote[]) => void;
}
