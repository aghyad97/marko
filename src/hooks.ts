import { useCallback, useEffect, useRef, useState } from "react";
import type { MarkoTheme } from "./types";

/** Debounced callback; flush() runs a pending call immediately. */
export function useDebounced<A extends unknown[]>(
  fn: (...args: A) => void,
  ms: number,
) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<A | null>(null);

  const flush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (pending.current) {
      const args = pending.current;
      pending.current = null;
      fnRef.current(...args);
    }
  }, []);

  const run = useCallback(
    (...args: A) => {
      pending.current = args;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, ms);
    },
    [flush, ms],
  );

  useEffect(() => flush, [flush]);
  return { run, flush };
}

/**
 * What the host app itself declares, via the Tailwind/shadcn convention:
 * a `dark`/`light` class or `data-theme` attribute on <html> or <body>.
 * Returns null when the host declares nothing.
 */
function hostDeclaredTheme(): "light" | "dark" | null {
  for (const el of [document.documentElement, document.body]) {
    if (!el) continue;
    const dt = el.getAttribute("data-theme");
    if (dt === "dark") return "dark";
    if (dt === "light") return "light";
    if (el.classList.contains("dark")) return "dark";
    if (el.classList.contains("light")) return "light";
  }
  return null;
}

/** Resolves "auto" (system) and "host" (host app's class/attr, then system), live. */
export function useResolvedTheme(theme: MarkoTheme): "light" | "dark" {
  const get = (): "light" | "dark" => {
    if (theme === "light" || theme === "dark") return theme;
    if (theme === "host") {
      const host = hostDeclaredTheme();
      if (host) return host;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };
  const [resolved, setResolved] = useState<"light" | "dark">(get);
  useEffect(() => {
    setResolved(get());
    if (theme === "light" || theme === "dark") return;
    const on = () => setResolved(get());
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", on);
    let mo: MutationObserver | undefined;
    if (theme === "host") {
      mo = new MutationObserver(on);
      const opts = { attributes: true, attributeFilter: ["class", "data-theme"] };
      mo.observe(document.documentElement, opts);
      if (document.body) mo.observe(document.body, opts);
    }
    return () => {
      mq.removeEventListener("change", on);
      mo?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);
  return resolved;
}

/** Bumps a counter on resize + DOM mutations so anchored positions recompute. */
export function useLayoutVersion(active: boolean): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const bump = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setV((x) => x + 1));
    };
    window.addEventListener("resize", bump);
    window.addEventListener("scroll", bump, { passive: true, capture: true });
    // Belt and suspenders: some drivers/environments resize the viewport
    // without a window resize event; ResizeObserver catches those.
    const ro = new ResizeObserver(bump);
    ro.observe(document.documentElement);
    ro.observe(document.body);
    const mo = new MutationObserver((muts) => {
      // Ignore mutations inside Marko's own portal to avoid feedback loops.
      if (
        muts.every((m) =>
          (m.target as Element).closest?.("[data-marko-root]"),
        )
      )
        return;
      bump();
    });
    mo.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
    });
    return () => {
      window.removeEventListener("resize", bump);
      window.removeEventListener("scroll", bump, { capture: true });
      mo.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [active]);
  return v;
}

export function relativeTime(ts: number): string {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const d = new Date(ts);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function isTypingTarget(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    el.isContentEditable
  );
}
