import { useEffect, useState } from "react";
import { getErrorMessage } from "../utils/errors";
import { ErrorBanner, inputClass, labelClass } from "./AuthLayout";
import Icon from "./Icon";

// Used for BOTH creating and editing.
// task === null  -> create mode.   task === {...} -> edit mode.
export default function TaskModal({ task, onClose, onSave }) {
  const isEdit = Boolean(task);
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [completed, setCompleted] = useState(task?.completed ?? false);
  const [priority, setPriority] = useState(task?.priority ?? "medium");
  const [dueDate, setDueDate] = useState(task?.due_date ?? ""); // "" means no due date
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Press Escape to close
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
            await onSave({
        title: title.trim(),
        description: description.trim(),
        completed,
        priority,
        due_date: dueDate || null, // backend expects null, not an empty string
      });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-[2px]"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl"
      >
        <div className="flex items-start justify-between p-6 pb-2">
          <div>
            <h2 id="task-modal-title" className="font-display text-xl font-semibold">
              {isEdit ? "Edit task" : "New task"}
            </h2>
            {isEdit && <p className="text-xs text-on-surface-variant mt-0.5">Task #{task.id}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-md text-on-surface-variant hover:bg-surface-container"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="p-6 pt-4 space-y-5">
          <ErrorBanner>{error}</ErrorBanner>

          <div>
            <div className="flex justify-between">
              <label htmlFor="task-title" className={labelClass}>Title</label>
              <span className="text-xs text-on-surface-variant">{title.length}/100</span>
            </div>
            <input
              id="task-title"
              className={inputClass}
              maxLength={100}
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div>
            <div className="flex justify-between">
              <label htmlFor="task-desc" className={labelClass}>Description</label>
              <span className="text-xs text-on-surface-variant">{description.length}/200</span>
            </div>
            <textarea
              id="task-desc"
              className={`${inputClass} h-28 py-2 resize-none`}
              maxLength={200}
              placeholder="Add a few details"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-priority" className={labelClass}>Priority</label>
              <select
                id="task-priority"
                className={inputClass}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label htmlFor="task-due" className={labelClass}>Due date (optional)</label>
              <input
                id="task-due"
                type="date"
                className={inputClass}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <label className="flex items-center justify-between gap-4 p-3 rounded-xl bg-surface-container-low cursor-pointer">
            <span>
              <span className="block text-sm font-medium">Mark as completed</span>
              <span className="block text-xs text-on-surface-variant">Completed tasks move to the Completed list</span>
            </span>
            <input
              type="checkbox"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
              className="sr-only peer"
            />
            <span
              aria-hidden="true"
              className="relative w-11 h-6 shrink-0 rounded-full bg-outline-variant transition-colors peer-checked:bg-primary-container peer-focus-visible:ring-2 peer-focus-visible:ring-primary-container after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5"
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 bg-surface-container-low rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container-high"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="h-10 px-5 rounded-lg bg-primary-container text-on-primary text-sm font-medium hover:bg-primary transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save task"}
          </button>
        </div>
      </form>
    </div>
  );
}
