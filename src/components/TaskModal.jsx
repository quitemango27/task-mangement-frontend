import { useEffect, useState } from "react";
import { getBreakdown } from "../api/ai";
import { getErrorMessage } from "../utils/errors";
import { spreadDates } from "../utils/dates";
import { ErrorBanner, inputClass, labelClass } from "./AuthLayout";
import Icon from "./Icon";

// Smaller fields for Mia's step rows (the shared inputClass is full-width and taller).
const stepFieldClass =
  "h-9 px-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent";

// Used for BOTH creating and editing.
// task === null  -> create mode.   task === {...} -> edit mode.
export default function TaskModal({ task, onClose, onSave, onSaveMany }) {
  const isEdit = Boolean(task);
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [completed, setCompleted] = useState(task?.completed ?? false);
  const [priority, setPriority] = useState(task?.priority ?? "medium");
  const [dueDate, setDueDate] = useState(task?.due_date ?? ""); // "" means no due date
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // "Break it down with Mia" (create mode only). null = not used; an array = Mia's suggested steps.
  const [steps, setSteps] = useState(null);
  const [thinking, setThinking] = useState(false);
  const reviewing = steps !== null;
  const chosen = reviewing ? steps.filter((st) => st.checked && st.title.trim()) : [];

  // Press Escape to close
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const askMia = async () => {
    setError("");
    setThinking(true);
    try {
      const res = await getBreakdown(title.trim(), description.trim());
      setSteps(res.data.steps.map((st) => ({ ...st, checked: true, due: "" })));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setThinking(false);
    }
  };

  const updateStep = (index, changes) =>
    setSteps((list) => list.map((st, i) => (i === index ? { ...st, ...changes } : st)));

  // Fill the dates of the ticked steps from the goal deadline.
  const applyDeadline = (mode) => {
    setError("");
    const ticked = steps.map((st, i) => (st.checked ? i : -1)).filter((i) => i >= 0);
    const dates = mode === "same" ? ticked.map(() => dueDate) : spreadDates(ticked.length, dueDate);
    if (!dates) {
      setError("Pick a deadline that isn't in the past.");
      return;
    }
    setSteps((list) => list.map((st, i) => (ticked.includes(i) ? { ...st, due: dates[ticked.indexOf(i)] } : st)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (reviewing) {
        // Each chosen step becomes its own task. They share the due date, and the
        // description says which goal they belong to.
        await onSaveMany(
          chosen.map((st) => ({
            title: st.title.trim(),
            description: `Part of: ${title.trim()}`.slice(0, 200),
            completed: false,
            priority: st.priority,
            due_date: st.due || null, // each step has its own date
          }))
        );
        onClose();
        return;
      }
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
        className="w-full max-w-lg max-h-[92vh] flex flex-col bg-surface-container-lowest rounded-2xl shadow-2xl"
      >
        <div className="flex items-start justify-between p-6 pb-2 shrink-0">
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

        <div className="p-6 pt-4 space-y-5 overflow-y-auto">
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
              readOnly={reviewing}
            />
            {!isEdit && !reviewing && (
              <button
                type="button"
                onClick={askMia}
                disabled={thinking || title.trim().length < 3}
                data-testid="breakdown-button"
                className="mt-2 h-9 px-3 rounded-lg text-sm font-medium flex items-center gap-1.5 bg-primary-fixed text-primary hover:bg-primary-fixed-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="auto_awesome" className="text-[18px]" />
                {thinking ? "Mia is thinking…" : "Break it down with Mia"}
              </button>
            )}
          </div>

          {reviewing && (
            <div data-testid="breakdown-steps" className="rounded-xl bg-surface-container-low p-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-sm font-medium">Mia's steps</p>
                <button
                  type="button"
                  onClick={() => setSteps(null)}
                  className="text-sm text-primary hover:underline"
                >
                  Back to a single task
                </button>
              </div>
              <ul className="flex flex-col gap-2">
                {steps.map((st, i) => (
                  <li key={i} className="rounded-lg bg-surface-container-lowest/60 p-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={st.checked}
                        onChange={(e) => updateStep(i, { checked: e.target.checked })}
                        aria-label={`Include step ${i + 1}`}
                        className="w-4 h-4 shrink-0 accent-[var(--color-primary-container)]"
                      />
                      <input
                        className={`${stepFieldClass} min-w-0 flex-1`}
                        value={st.title}
                        maxLength={100}
                        aria-label={`Step ${i + 1} title`}
                        onChange={(e) => updateStep(i, { title: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2 pl-6">
                      <select
                        className={`${stepFieldClass} w-24 shrink-0`}
                        value={st.priority}
                        aria-label={`Step ${i + 1} priority`}
                        onChange={(e) => updateStep(i, { priority: e.target.value })}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      <label className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                        Due
                        <input
                          type="date"
                          className={`${stepFieldClass} w-36`}
                          value={st.due}
                          aria-label={`Step ${i + 1} due date`}
                          onChange={(e) => updateStep(i, { due: e.target.value })}
                        />
                      </label>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-on-surface-variant">
                AI suggestions can be wrong. Edit or untick anything you don't need.
              </p>
            </div>
          )}

          {!reviewing && (
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
          )}

          <div className={reviewing ? "" : "grid grid-cols-2 gap-4"}>
            {!reviewing && (
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
            )}
            <div>
              <label htmlFor="task-due" className={labelClass}>
                {reviewing ? "Goal deadline (optional)" : "Due date (optional)"}
              </label>
              <input
                id="task-due"
                type="date"
                className={inputClass}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              {reviewing && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => applyDeadline("spread")}
                    disabled={!dueDate}
                    data-testid="spread-dates"
                    className="h-9 px-3 rounded-lg text-sm font-medium bg-primary-fixed text-primary hover:bg-primary-fixed-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Spread dates evenly
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDeadline("same")}
                    disabled={!dueDate}
                    className="h-9 px-3 rounded-lg text-sm font-medium border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Same date for all
                  </button>
                  <p className="w-full text-xs text-on-surface-variant">
                    Or set each step's date above. Steps without a date have no due date.
                  </p>
                </div>
              )}
            </div>
          </div>

          {!reviewing && (
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
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 bg-surface-container-low rounded-b-2xl shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container-high"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || (reviewing && chosen.length === 0)}
            className="h-10 px-5 rounded-lg bg-primary-container text-on-primary text-sm font-medium hover:bg-primary transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : reviewing ? `Add ${chosen.length} task${chosen.length === 1 ? "" : "s"}` : "Save task"}
          </button>
        </div>
      </form>
    </div>
  );
}
