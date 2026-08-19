import { IconList, IconMarker } from "./icons";

interface Props {
  on: boolean;
  hidden?: boolean;
  onToggleReview: () => void;
  onToggleSheet: () => void;
}

/**
 * Bottom-right control dock. Review mode off: a single marker button.
 * Review mode on: marker (active) + notes-panel button + count badge.
 */
export function Dock({ on, hidden, onToggleReview, onToggleSheet }: Props) {
  return (
    <div className="mk-dock" data-on={on} data-hidden={hidden || undefined}>
      <button
        className="mk-ib"
        data-on={on}
        title={on ? "Exit review mode (R)" : "Review mode (R)"}
        aria-pressed={on}
        aria-label={on ? "Exit review mode" : "Enter review mode"}
        onClick={onToggleReview}
      >
        <IconMarker width={17} height={17} />
        <span className="mk-kbd">R</span>
      </button>
      {on && (
        <>
          <span className="mk-dock-sep" />
          <button
            className="mk-ib"
            title="Review notes (L)"
            aria-label="Open review notes panel"
            onClick={onToggleSheet}
          >
            <IconList width={17} height={17} />
            <span className="mk-kbd">L</span>
          </button>
        </>
      )}
    </div>
  );
}
