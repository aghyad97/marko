import type { MarkoNote } from "../types";
import { anchorPagePoint } from "../anchor";

interface Props {
  notes: MarkoNote[];
  /** Bump to recompute tick positions on layout changes. */
  layoutVersion: number;
  onJump: (note: MarkoNote) => void;
}

/**
 * The review rail: a viewport-edge minimap. One tick per note, positioned by
 * where the note lives in the full document, like scrollbar annotations.
 */
export function Rail({ notes, layoutVersion, onJump }: Props) {
  void layoutVersion;
  if (notes.length === 0) return null;
  const docH = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight,
    1,
  );
  return (
    <div className="mk-rail">
      {notes.map((n) => {
        const p = anchorPagePoint(n);
        if (!p) return null; // anchor not on screen right now
        const topPct = Math.min(99, Math.max(0.5, (p.y / docH) * 100));
        return (
          <button
            key={n.id}
            className="mk-rail-tick"
            data-resolved={n.resolved}
            style={{ top: `${topPct}%` }}
            title={`Note ${n.num}: ${n.label}`}
            aria-label={`Scroll to note ${n.num}`}
            onClick={() => onJump(n)}
          />
        );
      })}
    </div>
  );
}
