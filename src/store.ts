import type { MarkoNote, MarkoPageState } from "./types";

const EMPTY: MarkoPageState = { notes: [], nextNum: 1 };

export function pageKey(prefix: string): string {
  return `${prefix}:${window.location.pathname}`;
}

export function loadState(prefix: string): MarkoPageState {
  try {
    const raw = window.localStorage.getItem(pageKey(prefix));
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<MarkoPageState>;
    if (!Array.isArray(parsed.notes)) return EMPTY;
    return {
      notes: parsed.notes as MarkoNote[],
      nextNum:
        typeof parsed.nextNum === "number"
          ? parsed.nextNum
          : parsed.notes.length + 1,
    };
  } catch {
    return EMPTY;
  }
}

export function saveState(prefix: string, state: MarkoPageState): void {
  try {
    if (state.notes.length === 0) {
      window.localStorage.removeItem(pageKey(prefix));
    } else {
      window.localStorage.setItem(pageKey(prefix), JSON.stringify(state));
    }
  } catch {
    // Quota or privacy mode: annotations stay in memory for the session.
  }
}

export function makeId(): string {
  return `mk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
