/**
 * Selector anchoring: build a resilient CSS selector for a clicked element,
 * resolve it later, and describe it for humans.
 */

const MARKO_ATTR = "data-marko-ui";

export function isMarkoElement(el: Element | null): boolean {
  return !!el?.closest(`[${MARKO_ATTR}]`);
}

function cssEscapeIdent(value: string): string {
  if (typeof CSS !== "undefined" && CSS.escape) return CSS.escape(value);
  return value.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`);
}

export function buildSelector(el: Element): string {
  const parts: string[] = [];
  let node: Element | null = el;
  while (node && node !== document.documentElement) {
    if (node.id) {
      parts.unshift(`#${cssEscapeIdent(node.id)}`);
      break;
    }
    const tag = node.tagName.toLowerCase();
    const parent: Element | null = node.parentElement;
    if (!parent) {
      parts.unshift(tag);
      break;
    }
    const siblings = Array.from(parent.children).filter(
      (c) => c.tagName === node!.tagName,
    );
    if (siblings.length > 1) {
      const idx = siblings.indexOf(node) + 1;
      parts.unshift(`${tag}:nth-of-type(${idx})`);
    } else {
      parts.unshift(tag);
    }
    node = parent;
  }
  return parts.join(" > ");
}

export function resolveSelector(selector: string): Element | null {
  try {
    const el = document.querySelector(selector);
    return el && !isMarkoElement(el) ? el : el;
  } catch {
    return null;
  }
}

/** Short human label for the sheet: prefers id, then heading/text content, then tag. */
export function describeElement(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `${tag}#${el.id}` : null;
  const text = (el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 40);
  if (id && text) return `${id} · ${text}`;
  if (id) return id;
  if (text) return `${tag} · ${text}`;
  return tag;
}

export interface AnchorPoint {
  x: number;
  y: number;
}

/**
 * Current page coordinates for a note's anchor, or null when the anchor
 * element is absent or hidden (e.g. it lives inside a closed modal). A null
 * point means the pin must not render — a marker floating over unrelated
 * content is worse than no marker.
 */
export function anchorPagePoint(note: {
  selector: string;
  fx: number;
  fy: number;
}): AnchorPoint | null {
  const el = resolveSelector(note.selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width <= 0 && r.height <= 0) return null;
  return {
    x: r.left + window.scrollX + r.width * note.fx,
    y: r.top + window.scrollY + r.height * note.fy,
  };
}
