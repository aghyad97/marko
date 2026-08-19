import type { MarkoNote } from "./types";

function stamp(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function noteToMarkdown(note: MarkoNote): string {
  const status = note.resolved ? " (resolved)" : "";
  return [
    `### ${note.num}. ${note.label}${status}`,
    "",
    note.text || "(no comment text)",
    "",
    `- selector: \`${note.selector}\``,
    `- updated: ${stamp(note.updatedAt)}`,
  ].join("\n");
}

export function allToMarkdown(notes: MarkoNote[]): string {
  const open = notes.filter((n) => !n.resolved).length;
  const header = [
    `# UI review notes`,
    "",
    `- page: ${window.location.pathname}`,
    `- exported: ${stamp(Date.now())}`,
    `- notes: ${notes.length} (${open} open)`,
    "",
    "",
  ].join("\n");
  return header + notes.map(noteToMarkdown).join("\n\n");
}

export function noteToJSON(note: MarkoNote): string {
  return JSON.stringify(exportShape(note), null, 2);
}

export function allToJSON(notes: MarkoNote[]): string {
  return JSON.stringify(
    {
      page: window.location.pathname,
      exportedAt: new Date().toISOString(),
      notes: notes.map(exportShape),
    },
    null,
    2,
  );
}

function exportShape(n: MarkoNote) {
  return {
    num: n.num,
    label: n.label,
    text: n.text,
    selector: n.selector,
    resolved: n.resolved,
    createdAt: new Date(n.createdAt).toISOString(),
    updatedAt: new Date(n.updatedAt).toISOString(),
  };
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Clipboard API can be unavailable on non-secure origins; fall back.
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("data-marko-ui", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
