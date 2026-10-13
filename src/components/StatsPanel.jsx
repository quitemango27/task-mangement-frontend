import { useState } from "react";
import Icon from "./Icon";
import { formatLongDate, weekdayShort } from "../utils/dates";

const CHART_HEIGHT = 120; // tallest column, in pixels
const TODAY_COLOR = "#4338ca"; // accent: today is the point of the chart
const OTHER_COLOR = "#8a84e6"; // same hue, lighter: the other days are context
const ZERO_COLOR = "#c7c4d7";

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

// "Your progress": streak numbers on the left, last 7 days as columns on the right.
export default function StatsPanel({ stats }) {
  const [hover, setHover] = useState(null); // index of the column being hovered / focused
  const [asTable, setAsTable] = useState(false);

  const days = stats.last_7_days;
  const todayIndex = days.length - 1;
  const max = Math.max(0, ...days.map((d) => d.count));
  const bestIndex = max > 0 ? days.findIndex((d) => d.count === max) : -1;

  const streak = stats.current_streak;
  const doneToday = stats.completed_today;
  const streakNote =
    streak === 0
      ? "Complete a task to start a streak."
      : doneToday === 0
      ? "Finish a task today to keep it going."
      : "You're on a roll. Come back tomorrow!";

  // Tooltips on the first and last columns hug the edge so they never leave the card.
  const tooltipPosition = (i) =>
    i <= 1 ? "left-0" : i >= days.length - 2 ? "right-0" : "left-1/2 -translate-x-1/2";

  return (
    <section
      aria-label="Your progress"
      data-testid="stats-panel"
      className="p-5 md:p-6 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col md:flex-row gap-6 md:gap-8"
    >
      {/* ---- Left: streak ---- */}
      <div className="md:w-56 shrink-0 md:border-r md:border-outline-variant/40 md:pr-8">
        <p className="text-sm font-medium text-on-surface-variant">Current streak</p>
        <div className="mt-1 flex items-center gap-2">
          <Icon
            name="local_fire_department"
            className={`text-[36px] ${streak > 0 ? "text-orange-500" : "text-outline-variant"}`}
          />
          <span data-testid="streak-value" className="font-display text-5xl font-bold tracking-tight">
            {streak}
          </span>
          <span className="self-end pb-2 text-sm text-on-surface-variant">{streak === 1 ? "day" : "days"}</span>
        </div>
        <p className="mt-1 text-xs text-on-surface-variant">{streakNote}</p>

        <dl className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <dt className="text-xs text-on-surface-variant">Best streak</dt>
            <dd data-testid="best-streak" className="font-display text-xl font-semibold">
              {plural(stats.best_streak, "day")}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-on-surface-variant">Done today</dt>
            <dd data-testid="done-today" className="font-display text-xl font-semibold">{doneToday}</dd>
          </div>
        </dl>
      </div>

      {/* ---- Right: last 7 days ---- */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold">Last 7 days</h2>
            <p data-testid="week-total" className="text-sm text-on-surface-variant">
              {plural(stats.completed_last_7_days, "task")} completed
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAsTable((v) => !v)}
            className="text-xs font-medium text-primary-container hover:underline"
          >
            {asTable ? "Show chart" : "Show table"}
          </button>
        </div>

        {asTable ? (
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-on-surface-variant">
                <th className="py-1 font-medium">Day</th>
                <th className="py-1 font-medium text-right">Tasks completed</th>
              </tr>
            </thead>
            <tbody>
              {days.map((d) => (
                <tr key={d.date} className="border-t border-outline-variant/30">
                  <td className="py-1.5">{formatLongDate(d.date)}</td>
                  <td className="py-1.5 text-right font-medium">{d.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div data-testid="week-chart" className="mt-6 flex gap-2 sm:gap-3 border-b border-outline-variant/40">
            {days.map((d, i) => {
              const isToday = i === todayIndex;
              const height = d.count === 0 ? 2 : Math.max(8, Math.round((d.count / max) * CHART_HEIGHT));
              // Only today and the best day carry a number; the tooltip and table hold the rest.
              const showLabel = d.count > 0 && (isToday || i === bestIndex);
              return (
                <div key={d.date} className="relative flex-1 flex flex-col items-center">
                  <button
                    type="button"
                    data-testid="day-column"
                    aria-label={`${formatLongDate(d.date)}: ${plural(d.count, "task")} completed`}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover(i)}
                    onBlur={() => setHover(null)}
                    style={{ height: CHART_HEIGHT + 24 }}
                    className="w-full flex items-end justify-center rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container"
                  >
                    <span
                      className="relative block w-5 rounded-t-[4px] transition-opacity"
                      style={{
                        height,
                        background: d.count === 0 ? ZERO_COLOR : isToday ? TODAY_COLOR : OTHER_COLOR,
                        opacity: hover !== null && hover !== i ? 0.6 : 1,
                      }}
                    >
                      {showLabel && (
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-semibold text-on-surface">
                          {d.count}
                        </span>
                      )}
                    </span>
                  </button>

                  <span className={`py-2 text-xs ${isToday ? "font-semibold text-on-surface" : "text-on-surface-variant"}`}>
                    {isToday ? "Today" : weekdayShort(d.date)}
                  </span>

                  {hover === i && (
                    <div
                      role="tooltip"
                      data-testid="chart-tooltip"
                      className={`absolute top-0 -translate-y-full z-10 whitespace-nowrap rounded-lg bg-inverse-surface px-3 py-1.5 text-xs text-white shadow-lg pointer-events-none ${tooltipPosition(i)}`}
                    >
                      <span className="opacity-80">{formatLongDate(d.date)}</span>{" "}
                      <span className="ml-1 font-semibold">{plural(d.count, "task")}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
