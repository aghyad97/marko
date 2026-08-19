import { useState } from "react";
import type { MarkoNote } from "../types";
import { allToJSON, allToMarkdown, copyText, noteToMarkdown } from "../exporters";
import {
  IconBraces,
  IconCheck,
  IconCheckCircle,
  IconCopy,
  IconMarkdown,
  IconPencil,
  IconTrash,
  IconUndo,
  IconX,
} from "./icons";

type Filter = "all" | "open" | "resolved";

interface Props {
  open: boolean;
  notes: MarkoNote[];
  activeId: string | null;
  /** ids whose anchor element is currently on the page (pin visible) */
  visibleIds: ReadonlySet<string>;
  onJump: (note: MarkoNote) => void;
  onEditText: (id: string, text: string) => void;
  onToggleResolved: (id: string) => void;
  onDelete: (id: string) => void;
  onRequestClearAll: () => void;
  onClose: () => void;
}

function timeShort(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Overlay side sheet (shadcn-style): scrim + slide-in panel. */
export function Sheet({
  open,
  notes,
  activeId,
  visibleIds,
  onJump,
  onEditText,
  onToggleResolved,
  onDelete,
  onRequestClearAll,
  onClose,
}: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const openCount = notes.filter((n) => !n.resolved).length;
  const shown =
    filter === "all"
      ? notes
      : notes.filter((n) => (filter === "open" ? !n.resolved : n.resolved));

  const flashCopied = (id: string) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1200);
  };

  const copyOne = async (note: MarkoNote) => {
    if (await copyText(noteToMarkdown(note))) flashCopied(note.id);
  };
  const copyAllMd = async () => {
    if (await copyText(allToMarkdown(notes))) flashCopied("__md__");
  };
  const copyAllJson = async () => {
    if (await copyText(allToJSON(notes))) flashCopied("__json__");
  };

  return (
    <>
      <div className="mk-scrim" data-open={open} onClick={onClose} />
      <aside className="mk-sheet" data-open={open} aria-hidden={!open} aria-label="Review notes">
        <div className="mk-sheet-head">
          <div className="mk-sheet-head-row">
            <span className="mk-sheet-title">Review notes</span>
            <span className="mk-sheet-count">
              {notes.length} {notes.length === 1 ? "note" : "notes"} · {openCount} open
            </span>
            <button className="mk-ib" title="Close (esc)" aria-label="Close panel" onClick={onClose}>
              <IconX />
            </button>
          </div>
          <div className="mk-filters">
            {(["all", "open", "resolved"] as const).map((f) => (
              <button
                key={f}
                className="mk-chip"
                data-on={filter === f}
                onClick={() => setFilter(f)}
              >
                {f === "all"
                  ? `All ${notes.length}`
                  : f === "open"
                    ? `Open ${openCount}`
                    : `Resolved ${notes.length - openCount}`}
              </button>
            ))}
          </div>
        </div>

        <div className="mk-rows">
          {shown.length === 0 && (
            <div className="mk-empty">
              <b>{notes.length === 0 ? "No notes yet" : "Nothing here"}</b>
              {notes.length === 0
                ? "Close this panel and click anywhere on the page to leave the first note."
                : "No notes match this filter."}
            </div>
          )}
          {shown.map((note) => (
            <div
              key={note.id}
              className="mk-row"
              data-resolved={note.resolved}
              data-current={activeId === note.id}
              data-detached={!visibleIds.has(note.id)}
            >
              <span className="mk-row-num">{note.num}</span>
              <div className="mk-row-body">
                <button
                  style={{ display: "block", width: "100%", textAlign: "left" }}
                  disabled={!visibleIds.has(note.id)}
                  onClick={() => onJump(note)}
                  aria-label={`Go to note ${note.num}`}
                >
                  <div className="mk-row-sel" title={note.selector}>
                    {note.label}
                  </div>
                  {editingId !== note.id && (
                    <p className="mk-row-text">{note.text || "(no comment text)"}</p>
                  )}
                </button>
                {editingId === note.id ? (
                  <div className="mk-row-edit">
                    <textarea
                      autoFocus
                      name={`marko-edit-${note.num}`}
                      aria-label={`Edit note ${note.num}`}
                      value={note.text}
                      onChange={(e) => onEditText(note.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          e.stopPropagation();
                          setEditingId(null);
                        }
                        if (e.key === "Enter" && !e.shiftKey && !e.altKey) {
                          e.preventDefault();
                          setEditingId(null);
                        }
                      }}
                    />
                    <div className="mk-row-edit-acts">
                      <span className="mk-savehint">Autosaves as you type</span>
                      <button className="mk-btn mk-btn-primary" onClick={() => setEditingId(null)}>
                        Done<span className="mk-kbd mk-kbd-onaccent">{"↵"}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mk-row-meta">
                    {timeShort(note.updatedAt)}
                    {note.resolved ? " · resolved" : ""}
                    {!visibleIds.has(note.id) && (
                      <span className="mk-offscreen"> · not on screen</span>
                    )}
                  </div>
                )}
              </div>
              <div className="mk-row-acts">
                <button
                  className="mk-ib"
                  data-on={note.resolved}
                  title={note.resolved ? "Reopen" : "Resolve"}
                  aria-label={note.resolved ? `Reopen note ${note.num}` : `Resolve note ${note.num}`}
                  onClick={() => onToggleResolved(note.id)}
                >
                  {note.resolved ? <IconUndo /> : <IconCheckCircle />}
                </button>
                <button
                  className="mk-ib"
                  data-ok={copiedId === note.id}
                  title="Copy as Markdown"
                  aria-label={`Copy note ${note.num}`}
                  onClick={() => copyOne(note)}
                >
                  {copiedId === note.id ? <IconCheck /> : <IconCopy />}
                </button>
                <button
                  className="mk-ib"
                  data-on={editingId === note.id}
                  title="Edit"
                  aria-label={`Edit note ${note.num}`}
                  onClick={() => setEditingId(editingId === note.id ? null : note.id)}
                >
                  <IconPencil />
                </button>
                <button
                  className="mk-ib"
                  data-danger=""
                  title="Delete note"
                  aria-label={`Delete note ${note.num}`}
                  onClick={() => onDelete(note.id)}
                >
                  <IconTrash />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mk-sheet-foot">
          <div className="mk-export-row">
            <button className="mk-exportbtn" onClick={copyAllMd} disabled={notes.length === 0}>
              {copiedId === "__md__" ? <IconCheck /> : <IconMarkdown width={16} height={16} />}
              {copiedId === "__md__" ? "Copied" : "Copy Markdown"}
            </button>
            <button className="mk-exportbtn" onClick={copyAllJson} disabled={notes.length === 0}>
              {copiedId === "__json__" ? <IconCheck /> : <IconBraces width={15} height={15} />}
              {copiedId === "__json__" ? "Copied" : "Copy JSON"}
            </button>
          </div>
          {notes.length > 0 && (
            <button className="mk-clearbtn" onClick={onRequestClearAll}>
              <IconTrash width={13} height={13} />
              Clear all notes on this page
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
