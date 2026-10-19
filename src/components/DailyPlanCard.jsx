import { useState } from "react";
import { getDailyPlan } from "../api/ai";
import { getErrorMessage } from "../utils/errors";
import Icon from "./Icon";

const PRIORITY_STYLES = {
  high: "bg-red-100 text-red-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-emerald-100 text-emerald-800",
};

function formatDue(due) {
  if (!due) return null;
  const [y, m, d] = due.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

// "Plan my day with Mia": asks the AI which tasks to do today, and shows her answer.
export default function DailyPlanCard({ pendingCount }) {
  const [state, setState] = useState("idle"); // idle | loading | done | error
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(true); // is the plan shown, or tucked away?

  const ask = async () => {
    setState("loading");
    setError("");
    try {
      const res = await getDailyPlan();
      setPlan(res.data);
      setOpen(true);
      setState("done");
    } catch (err) {
      setError(getErrorMessage(err));
      setState("error");
    }
  };

  return (
    <section
      data-testid="daily-plan"
      aria-label="Your plan for today"
      className="p-5 rounded-2xl bg-surface-container-lowest shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center shrink-0">
            <Icon name="auto_awesome" className="text-[22px]" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold leading-tight">What should I do today?</h2>
            <p className="text-sm text-on-surface-variant">
              Mia looks at your {pendingCount} pending task{pendingCount === 1 ? "" : "s"} and picks what matters most.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {state === "done" && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="daily-plan-body"
              data-testid="daily-plan-toggle"
              className="h-10 px-3 rounded-lg border border-outline-variant text-sm font-medium flex items-center justify-center gap-1.5 text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              <Icon name={open ? "expand_less" : "expand_more"} className="text-[18px]" />
              {open ? "Hide plan" : "Show plan"}
            </button>
          )}
          <button
            type="button"
            onClick={ask}
            disabled={state === "loading" || pendingCount === 0}
            className="h-10 px-4 rounded-lg bg-primary-container text-on-primary text-sm font-medium flex items-center justify-center gap-2 shadow-sm hover:bg-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Icon name={state === "done" ? "refresh" : "auto_awesome"} className="text-[18px]" />
            {state === "loading" ? "Mia is thinking…" : state === "done" ? "Plan again" : "Plan my day"}
          </button>
        </div>
      </div>

      {state === "loading" && (
        <p role="status" className="mt-4 text-sm text-on-surface-variant">
          Looking through your tasks… this can take a few seconds the first time.
        </p>
      )}

      {state === "error" && (
        <p role="alert" data-testid="daily-plan-error" className="mt-4 text-sm px-3 py-2 rounded-lg bg-error-container text-on-error-container">
          {error}
        </p>
      )}

      {state === "done" && plan && !open && (
        <p data-testid="daily-plan-collapsed" className="mt-3 text-sm text-on-surface-variant">
          Your plan is ready ({plan.items.length} task{plan.items.length === 1 ? "" : "s"}). Tap “Show plan” to see it again.
        </p>
      )}

      {state === "done" && plan && open && (
        <div id="daily-plan-body" className="mt-4" data-testid="daily-plan-result">
          <p className="font-display font-semibold">{plan.summary}</p>

          {plan.items.length === 0 ? (
            <p className="mt-2 text-sm text-on-surface-variant">Nothing to plan right now.</p>
          ) : (
            <ol className="mt-3 flex flex-col gap-2">
              {plan.items.map((item, i) => (
                <li key={item.task_id} className="flex gap-3 p-3 rounded-xl bg-surface-container-low">
                  <span className="w-7 h-7 rounded-full bg-primary-container text-on-primary text-sm font-semibold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium break-words">{item.title}</p>
                    <p className="text-sm text-on-surface-variant mt-0.5">{item.reason}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${PRIORITY_STYLES[item.priority]}`}>
                        {item.priority}
                      </span>
                      {item.due_date && (
                        <span className="text-xs text-on-surface-variant">Due {formatDue(item.due_date)}</span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
          <p className="mt-3 text-xs text-on-surface-variant">AI suggestions can be wrong. You know your day best.</p>
        </div>
      )}
    </section>
  );
}
