// due_date from the backend looks like "2026-10-24" (year-month-day).

// Today's date in the same format, using the person's own timezone.
export function todayString() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// A task is overdue if it has a due date in the past and is not completed.
// (Strings in YYYY-MM-DD format compare correctly as plain text.)
export function isOverdue(task) {
  return Boolean(task.due_date) && !task.completed && task.due_date < todayString();
}

// "2026-10-24" -> "Oct 24"
export function formatDueDate(dateString) {
  const [y, m, d] = dateString.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// "2026-10-13" -> "Tue"
export function weekdayShort(dateString) {
  const [y, m, d] = dateString.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "short" });
}

// "2026-10-13" -> "Tue, Oct 13"
export function formatLongDate(dateString) {
  const [y, m, d] = dateString.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
