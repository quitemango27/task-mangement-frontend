import { useEffect, useState } from "react";
import { getErrorMessage } from "../utils/errors";
import { ErrorBanner } from "./AuthLayout";
import Icon from "./Icon";

export default function ConfirmDialog({ task, onCancel, onConfirm }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      await onConfirm();
    } catch (err) {
      setError(getErrorMessage(err));
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-[2px]"
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        className="w-full max-w-sm bg-surface-container-lowest rounded-2xl shadow-2xl p-6"
      >
        <div className="w-10 h-10 rounded-full bg-error-container text-error flex items-center justify-center mb-4">
          <Icon name="delete" className="text-[22px]" />
        </div>
        <h2 id="delete-title" className="font-display text-xl font-semibold">Delete this task?</h2>
        <p className="text-sm text-on-surface-variant mt-2">
          “<span className="font-medium text-on-surface break-words">{task.title}</span>” will be permanently
          removed. This can't be undone.
        </p>

        {error && <div className="mt-4"><ErrorBanner>{error}</ErrorBanner></div>}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="h-10 px-4 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="h-10 px-5 rounded-lg bg-error text-white text-sm font-medium hover:brightness-90 transition disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete task"}
          </button>
        </div>
      </div>
    </div>
  );
}
