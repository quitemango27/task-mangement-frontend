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

// Whole days from one "YYYY-MM-DD" date to another (negative if `to` is earlier).
// Uses UTC midnights so daylight-saving changes can't add or remove an hour.
function daysBetween(from, to) {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000);
}

// "2026-10-20" + 3 -> "2026-10-23"
function addDays(dateString, days) {
  const [y, m, d] = dateString.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return t.toISOString().slice(0, 10);
}

// Spread `count` steps over the days from today to a deadline. The last step lands on
// the deadline. Returns null if the deadline is already in the past.
//   spreadDates(3, "2026-10-30", "2026-10-20") -> ["2026-10-24", "2026-10-27", "2026-10-30"]
export function spreadDates(count, deadline, today = todayString()) {
  const total = daysBetween(today, deadline);
  if (total < 0) return null;
  return Array.from({ length: count }, (_, i) => addDays(today, Math.ceil((total * (i + 1)) / count)));
}
