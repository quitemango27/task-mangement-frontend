import Icon from "./Icon";
import { formatDueDate, isOverdue } from "../utils/dates";

const PRIORITY_STYLES = {
  high: "bg-red-100 text-red-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-emerald-100 text-emerald-800",
};

export default function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const overdue = isOverdue(task);

  return (
    <div
      className={`flex flex-col p-4 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow group
      ${overdue ? "ring-1 ring-error/40" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox: marks the task completed / pending */}
        <button
          onClick={() => onToggle(task)}
          role="checkbox"
          aria-checked={task.completed}
          aria-label={task.completed ? "Mark as pending" : "Mark as completed"}
          className={`mt-1 w-5 h-5 shrink-0 rounded flex items-center justify-center border transition-colors
          ${task.completed
            ? "bg-primary-container border-primary-container text-on-primary"
            : "bg-surface-container-lowest border-outline hover:border-primary-container"}`}
        >
          {task.completed && <Icon name="check" className="text-[16px]" />}
        </button>

        <div className="flex-1 min-w-0">
          <h2
            className={`font-display font-semibold text-lg leading-snug break-words
            ${task.completed ? "line-through text-on-surface-variant" : ""}`}
          >
            {task.title}
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant line-clamp-2 break-words">
            {task.description}
          </p>
        </div>

        <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            title="Edit task"
            aria-label="Edit task"
            className="p-1 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          >
            <Icon name="edit" className="text-[18px]" />
          </button>
          <button
            onClick={() => onDelete(task)}
            title="Delete task"
            aria-label="Delete task"
            className="p-1 rounded-md text-on-surface-variant hover:text-error hover:bg-error-container"
          >
            <Icon name="delete" className="text-[18px]" />
          </button>
        </div>
      </div>

      {/* Badges: status, priority, due date */}
      <div className="mt-4 pl-8 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
          ${task.completed ? "bg-primary-fixed text-primary" : "bg-amber-100 text-amber-800"}`}
        >
          {task.completed ? "Completed" : "Pending"}
        </span>

        <span
          data-testid="priority-badge"
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.medium}`}
        >
          {task.priority}
        </span>

        {task.due_date && (
          <span
            className={`inline-flex items-center gap-1 text-xs ml-auto
            ${overdue ? "text-error font-semibold" : "text-on-surface-variant"}`}
          >
            <Icon name={overdue ? "warning" : "event"} className="text-[14px]" />
            {overdue ? "Overdue · " : ""}
            {formatDueDate(task.due_date)}
          </span>
        )}
      </div>
    </div>
  );
}