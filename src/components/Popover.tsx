import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { MarkoNote } from "../types";
import { relativeTime } from "../hooks";
import { IconCheckCircle, IconTrash, IconUndo, IconX } from "./icons";

const WIDTH = 320;
const GAP = 16;

const isMac =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const MOD = isMac ? "⌘" : "Ctrl+";

interface Props {
  note: MarkoNote;
  anchor: { x: number; y: number };
  savedAt: number | null;
  onText: (text: string) => void;
  onResolve: () => void;
  onDelete: () => void;
  onClose: () => void;
}

/**
 * Comment popover anchored to a pin, flipping to stay inside the viewport.
 *
 * Shortcuts (fast review flow): Enter closes (Done), Shift+Enter inserts
 * a newline, Mod+E toggles resolve, Mod+Backspace deletes. Escape is handled
 * globally and shows no hint by design.
 */
export function Popover({
  note,
  anchor,
  savedAt,
  onText,
  onResolve,
  onDelete,
  onClose,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [pos, setPos] = useState({ left: anchor.x + GAP, top: anchor.y + GAP });
  const [, tick] = useState(0);

  useLayoutEffect(() => {
    const h = ref.current?.offsetHeight ?? 200;
    let left = anchor.x + GAP;
    let top = anchor.y + GAP;
    const viewRight = window.scrollX + window.innerWidth;
    const viewBottom = window.scrollY + window.innerHeight;
    if (left + WIDTH + 8 > viewRight) left = anchor.x - WIDTH - GAP;
    if (left < window.scrollX + 8) left = window.scrollX + 8;
    if (top + h + 8 > viewBottom) top = Math.max(window.scrollY + 8, anchor.y - h - GAP);
    setPos({ left, top });
  }, [anchor.x, anchor.y, note.id]);

  useEffect(() => {
    taRef.current?.focus();
    taRef.current?.setSelectionRange(
      taRef.current.value.length,
      taRef.current.value.length,
    );
  }, [note.id]);

  // Keep the "Saved Ns ago" hint honest while the popover is open.
  useEffect(() => {
    if (savedAt == null) return;
    const t = setInterval(() => tick((x) => x + 1), 5000);
    return () => clearInterval(t);
  }, [savedAt]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const mod = e.metaKey || e.ctrlKey;
    if (e.key === "Enter" && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      onClose();
    } else if (mod && (e.key === "e" || e.key === "E")) {
      e.preventDefault();
      onResolve();
    } else if (mod && e.key === "Backspace") {
      e.preventDefault();
      onDelete();
    }
  };

  return (
    <div
      ref={ref}
      className="mk-pop"
      style={{ left: pos.left, top: pos.top }}
      role="dialog"
      aria-label={`Note ${note.num}`}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={onKeyDown}
    >
      <div className="mk-pop-head">
        <span className="mk-pop-num">{note.num}</span>
        <span className="mk-pop-sel" title={note.selector}>
          {note.label}
        </span>
        <button className="mk-ib" title="Close (esc)" aria-label="Close" onClick={onClose}>
          <IconX />
        </button>
      </div>
      <div className="mk-pop-body">
        <textarea
          ref={taRef}
          name={`marko-note-${note.num}`}
          aria-label={`Note ${note.num} text`}
          value={note.text}
          placeholder="What should change here?  (Shift+Enter for a new line)"
          onChange={(e) => onText(e.target.value)}
        />
      </div>
      <div className="mk-pop-foot">
        <button
          className="mk-ib"
          data-danger=""
          title={`Delete note (${MOD}⌫)`}
          aria-label="Delete note"
          onClick={onDelete}
        >
          <IconTrash />
        </button>
        <button
          className="mk-ib"
          data-on={note.resolved}
          title={`${note.resolved ? "Reopen" : "Resolve"} (${MOD}E)`}
          aria-label={note.resolved ? "Reopen note" : "Resolve note"}
          onClick={onResolve}
        >
          {note.resolved ? <IconUndo /> : <IconCheckCircle />}
        </button>
        <span className="mk-savehint">
          {savedAt ? `Saved ${relativeTime(savedAt)}` : "Autosaves as you type"}
        </span>
        <button className="mk-btn mk-btn-primary" onClick={onClose}>
          Done<span className="mk-kbd mk-kbd-onaccent">{"↵"}</span>
        </button>
      </div>
    </div>
  );
}
