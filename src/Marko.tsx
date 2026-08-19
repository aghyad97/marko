import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { MarkoNote, MarkoPageState, MarkoProps } from "./types";
import {
  anchorPagePoint,
  buildSelector,
  describeElement,
  isMarkoElement,
} from "./anchor";
import { loadState, makeId, saveState } from "./store";
import { injectStyles } from "./styles";
import { useDebounced, useLayoutVersion, useResolvedTheme, isTypingTarget } from "./hooks";
import { Dock } from "./components/Dock";
import { Popover } from "./components/Popover";
import { Sheet } from "./components/Sheet";
import { Rail } from "./components/Rail";
import { ConfirmDialog } from "./components/ConfirmDialog";

declare const process:
  | { env?: Record<string, string | undefined> }
  | undefined;

function defaultEnabled(): boolean {
  try {
    return typeof process === "undefined" || process?.env?.NODE_ENV !== "production";
  } catch {
    return true;
  }
}

export function Marko(props: MarkoProps) {
  const enabled = props.enabled ?? defaultEnabled();
  if (!enabled) return null;
  return <MarkoActive {...props} />;
}

function MarkoActive({
  theme = "host",
  storageKey = "marko",
  saveDebounceMs = 400,
  onChange,
}: MarkoProps) {
  const [portalEl, setPortalEl] = useState<HTMLDivElement | null>(null);
  const [reviewOn, setReviewOn] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [state, setState] = useState<MarkoPageState>(() => loadState(storageKey));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [hoverRect, setHoverRect] = useState<DOMRect | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [altHeld, setAltHeld] = useState(false);
  const [hoverPinId, setHoverPinId] = useState<string | null>(null);
  const resolvedTheme = useResolvedTheme(theme);
  const layoutVersion = useLayoutVersion(reviewOn);

  // Portal root + styles
  useEffect(() => {
    const el = document.createElement("div");
    el.setAttribute("data-marko-root", "");
    el.setAttribute("data-marko-ui", "");
    el.style.position = "absolute";
    el.style.top = "0";
    el.style.left = "0";
    el.style.width = "0";
    el.style.height = "0";
    document.body.appendChild(el);
    const removeStyles = injectStyles(document);
    setPortalEl(el);
    return () => {
      el.remove();
      removeStyles();
    };
  }, []);

  useEffect(() => {
    portalEl?.setAttribute("data-marko-theme", resolvedTheme);
  }, [portalEl, resolvedTheme]);

  // Persistence: every state change flows through one debounced save.
  const { run: persist, flush: persistNow } = useDebounced(
    (s: MarkoPageState) => {
      saveState(storageKey, s);
      setSavedAt(Date.now());
      onChange?.(s.notes);
    },
    saveDebounceMs,
  );
  const update = useCallback(
    (fn: (s: MarkoPageState) => MarkoPageState, immediate = false) => {
      setState((prev) => {
        const next = fn(prev);
        persist(next);
        return next;
      });
      if (immediate) setTimeout(persistNow, 0);
    },
    [persist, persistNow],
  );

  const notes = state.notes;
  const activeNote = notes.find((n) => n.id === activeId) ?? null;
  const notesRef = useRef(notes);
  notesRef.current = notes;

  /**
   * Change which note's popover is open. Closing away from a note that never
   * got any text deletes it — empty notes are noise, and Escape/outside-click
   * should behave like "never mind".
   */
  const switchActive = useCallback(
    (next: string | null) => {
      setActiveId((cur) => {
        if (cur && cur !== next) {
          const n = notesRef.current.find((x) => x.id === cur);
          if (n && !n.text.trim()) {
            update((s) => ({ ...s, notes: s.notes.filter((x) => x.id !== cur) }), true);
          }
        }
        return next;
      });
    },
    [update],
  );

  // ---- note operations ----
  const createNoteAt = useCallback(
    (clientX: number, clientY: number) => {
      const el =
        document
          .elementsFromPoint(clientX, clientY)
          .find((e) => !isMarkoElement(e) && e !== document.documentElement) ??
        document.body;
      const r = el.getBoundingClientRect();
      const note: MarkoNote = {
        id: makeId(),
        num: state.nextNum,
        selector: buildSelector(el),
        label: describeElement(el),
        fx: r.width > 0 ? (clientX - r.left) / r.width : 0.5,
        fy: r.height > 0 ? (clientY - r.top) / r.height : 0.5,
        pageX: clientX + window.scrollX,
        pageY: clientY + window.scrollY,
        text: "",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        resolved: false,
      };
      update(
        (s) => ({ ...s, notes: [...s.notes, note], nextNum: s.nextNum + 1 }),
        true,
      );
      setActiveId(note.id);
    },
    [state.nextNum, update],
  );

  const setNoteText = useCallback(
    (id: string, text: string) => {
      update((s) => ({
        ...s,
        notes: s.notes.map((n) =>
          n.id === id ? { ...n, text, updatedAt: Date.now() } : n,
        ),
      }));
    },
    [update],
  );

  const toggleResolved = useCallback(
    (id: string) => {
      update(
        (s) => ({
          ...s,
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, resolved: !n.resolved, updatedAt: Date.now() } : n,
          ),
        }),
        true,
      );
    },
    [update],
  );

  const deleteNote = useCallback(
    (id: string) => {
      setActiveId((a) => (a === id ? null : a));
      update((s) => ({ ...s, notes: s.notes.filter((n) => n.id !== id) }), true);
    },
    [update],
  );

  const clearAll = useCallback(() => {
    setActiveId(null);
    update((s) => ({ ...s, notes: [], nextNum: 1 }), true);
  }, [update]);

  const jumpTo = useCallback(
    (note: MarkoNote) => {
      const p = anchorPagePoint(note);
      if (!p) return; // anchor not on screen (e.g. inside a closed modal)
      setSheetOpen(false);
      window.scrollTo({
        top: Math.max(0, p.y - window.innerHeight / 2),
        behavior: "smooth",
      });
      switchActive(note.id);
    },
    [switchActive],
  );

  // ---- keyboard ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // ConfirmDialog handles its own Escape and stops propagation.
        if (activeId) switchActive(null);
        else if (sheetOpen) setSheetOpen(false);
        else if (reviewOn) setReviewOn(false);
        return;
      }
      if (isTypingTarget(e.target)) return;
      const plain = !e.metaKey && !e.ctrlKey && !e.altKey;
      if ((e.key === "r" || e.key === "R") && plain) {
        setReviewOn((v) => !v);
        switchActive(null);
        setSheetOpen(false);
      } else if ((e.key === "l" || e.key === "L") && plain && reviewOn) {
        switchActive(null);
        setSheetOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId, reviewOn, sheetOpen, switchActive]);

  // Hold Alt/Option to click through to the host page while reviewing.
  useEffect(() => {
    const dn = (e: KeyboardEvent) => e.key === "Alt" && setAltHeld(true);
    const up = (e: KeyboardEvent) => e.key === "Alt" && setAltHeld(false);
    const clear = () => setAltHeld(false);
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", dn);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, []);

  // ---- capture layer handlers ----
  const onCaptureMove = useCallback((e: React.MouseEvent) => {
    const el = document
      .elementsFromPoint(e.clientX, e.clientY)
      .find((x) => !isMarkoElement(x) && x !== document.documentElement);
    setHoverRect(el ? el.getBoundingClientRect() : null);
  }, []);

  const onCaptureClick = useCallback(
    (e: React.MouseEvent) => {
      if (activeId) {
        switchActive(null);
        return;
      }
      createNoteAt(e.clientX, e.clientY);
    },
    [activeId, createNoteAt, switchActive],
  );

  // Only notes whose anchor element is currently present and visible get a
  // pin — a note left on a closed modal stays in the sheet, not on the page.
  const pinPoints = useMemo(
    () =>
      notes
        .map((n) => ({ note: n, p: anchorPagePoint(n) }))
        .filter((x): x is { note: MarkoNote; p: { x: number; y: number } } => x.p !== null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notes, layoutVersion],
  );
  const visibleIds = useMemo(
    () => new Set(pinPoints.map(({ note }) => note.id)),
    [pinPoints],
  );
  const activePoint = activeNote ? anchorPagePoint(activeNote) : null;

  // If the active note's anchor disappears (modal closed under it), close the
  // popover rather than leaving it orphaned.
  useEffect(() => {
    if (activeNote && !activePoint) switchActive(null);
  });

  if (!portalEl) return null;

  return createPortal(
    <>
      {reviewOn && (
        <>
          <div
            className="mk-capture"
            style={altHeld ? { pointerEvents: "none" } : undefined}
            onMouseMove={onCaptureMove}
            onMouseLeave={() => setHoverRect(null)}
            onClick={onCaptureClick}
          />
          {hoverRect && !activeId && !altHeld && (
            <div
              className="mk-hoverbox"
              style={{
                left: hoverRect.left,
                top: hoverRect.top,
                width: hoverRect.width,
                height: hoverRect.height,
              }}
            />
          )}

          {pinPoints.map(({ note, p }) => (
            <button
              key={note.id}
              className="mk-pin"
              data-resolved={note.resolved}
              data-active={note.id === activeId}
              style={{ left: p.x, top: p.y, position: "absolute" }}
              aria-label={`Note ${note.num}`}
              onClick={(e) => {
                e.stopPropagation();
                setHoverPinId(null);
                switchActive(note.id === activeId ? null : note.id);
              }}
              onMouseEnter={() => setHoverPinId(note.id)}
              onMouseLeave={() => setHoverPinId((h) => (h === note.id ? null : h))}
            >
              {note.num}
            </button>
          ))}

          {(() => {
            const hovered =
              hoverPinId && hoverPinId !== activeId
                ? pinPoints.find(({ note }) => note.id === hoverPinId)
                : null;
            if (!hovered) return null;
            const { note, p } = hovered;
            const below = p.y - window.scrollY < 150;
            const half = 145;
            const left = Math.min(
              Math.max(p.x + 7, window.scrollX + half),
              window.scrollX + window.innerWidth - half,
            );
            return (
              <div
                className="mk-tip"
                style={{
                  left,
                  top: below ? p.y + 10 : p.y - 34,
                  transform: below ? "translate(-50%, 0)" : undefined,
                }}
                role="tooltip"
              >
                <div className="mk-tip-text" data-empty={!note.text}>
                  {note.text || "No comment yet"}
                </div>
                <div className="mk-tip-meta">
                  {note.resolved ? "resolved · " : ""}click to edit
                </div>
              </div>
            );
          })()}

          {activeNote && activePoint && (
            <Popover
              note={activeNote}
              anchor={activePoint}
              savedAt={savedAt}
              onText={(t) => setNoteText(activeNote.id, t)}
              onResolve={() => toggleResolved(activeNote.id)}
              onDelete={() => deleteNote(activeNote.id)}
              onClose={() => switchActive(null)}
            />
          )}

          <Rail
            notes={notes}
            layoutVersion={layoutVersion}
            onJump={jumpTo}
          />

          <Sheet
            open={sheetOpen}
            notes={notes}
            activeId={activeId}
            visibleIds={visibleIds}
            onJump={jumpTo}
            onEditText={setNoteText}
            onToggleResolved={toggleResolved}
            onDelete={deleteNote}
            onRequestClearAll={() => setConfirmClear(true)}
            onClose={() => setSheetOpen(false)}
          />

          {confirmClear && (
            <ConfirmDialog
              title="Clear all notes?"
              body={`This permanently deletes all ${notes.length} ${notes.length === 1 ? "note" : "notes"} on this page. There is no undo. Copy them as Markdown or JSON first if you need a record.`}
              confirmLabel="Delete everything"
              onConfirm={() => {
                setConfirmClear(false);
                setSheetOpen(false);
                clearAll();
              }}
              onCancel={() => setConfirmClear(false)}
            />
          )}
        </>
      )}

      <Dock
        on={reviewOn}
        hidden={sheetOpen}
        onToggleReview={() => {
          setReviewOn((v) => !v);
          setActiveId(null);
          setSheetOpen(false);
        }}
        onToggleSheet={() => setSheetOpen((v) => !v)}
      />
    </>,
    portalEl,
  );
}
