import { useEffect, useRef } from "react";

interface Props {
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Destructive confirmation dialog. Cancel is the default-focused action;
 * Tab cycles between the two buttons; Escape cancels.
 */
export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    restoreRef.current = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    return () => restoreRef.current?.focus?.();
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onCancel();
    } else if (e.key === "Tab") {
      e.preventDefault();
      const next =
        document.activeElement === cancelRef.current
          ? confirmRef.current
          : cancelRef.current;
      next?.focus();
    }
  };

  return (
    <>
      <div className="mk-dim" onClick={onCancel} />
      <div
        className="mk-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="mk-dialog-title"
        aria-describedby="mk-dialog-body"
        onKeyDown={onKeyDown}
      >
        <h2 id="mk-dialog-title">{title}</h2>
        <p id="mk-dialog-body">{body}</p>
        <div className="mk-dialog-acts">
          <button ref={cancelRef} className="mk-btn mk-btn-quiet" onClick={onCancel}>
            Cancel
          </button>
          <button ref={confirmRef} className="mk-btn mk-btn-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}
