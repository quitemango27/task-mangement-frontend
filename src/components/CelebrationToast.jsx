import { useEffect, useMemo } from "react";
import CoachAvatar from "./CoachAvatar";
import Icon from "./Icon";
import { CELEBRATE_ALL, CELEBRATE_ONE } from "../utils/coach";

const COLORS = ["#4f46e5", "#fbbf24", "#10b981", "#f43f5e", "#38bdf8", "#a855f7"];

// Pop-up that appears right after you complete a task.
export default function CelebrationToast({ allDone, streak = 0, onDone }) {
  // Choose the message and confetti once, so they don't change on every re-render.
  const message = useMemo(() => {
    if (streak >= 2) {
      return allDone
        ? `Everything done and a ${streak}-day streak!`
        : `Hurrah! That's a ${streak}-day streak!`;
    }
    const list = allDone ? CELEBRATE_ALL : CELEBRATE_ONE;
    return list[Math.floor(Math.random() * list.length)];
  }, [allDone, streak]);

  const confetti = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 1.4 + Math.random() * 1.2,
        color: COLORS[i % COLORS.length],
        rotate: Math.random() * 360,
      })),
    []
  );

  // Close by itself after a few seconds.
  useEffect(() => {
    const timer = setTimeout(onDone, allDone ? 6000 : 4000);
    return () => clearTimeout(timer);
  }, [onDone, allDone]);

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="celebration"
      className="fixed z-[60] bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96"
    >
      <div className="relative overflow-hidden flex items-center gap-3 p-4 rounded-2xl bg-surface-container-lowest shadow-2xl ring-1 ring-primary-fixed coach-toast-in">
        {/* Confetti falls inside the card */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {confetti.map((c) => (
            <span
              key={c.id}
              className="confetti-piece"
              style={{
                left: `${c.left}%`,
                background: c.color,
                animationDelay: `${c.delay}s`,
                animationDuration: `${c.duration}s`,
                transform: `rotate(${c.rotate}deg)`,
              }}
            />
          ))}
        </div>

        <CoachAvatar mood="cheer" size={72} className="shrink-0 coach-bounce relative" />
        <p className="relative font-display text-lg font-bold leading-snug flex-1">{message}</p>
        <button
          onClick={onDone}
          aria-label="Dismiss"
          className="relative self-start p-1 rounded-md text-on-surface-variant hover:bg-surface-container"
        >
          <Icon name="close" className="text-[18px]" />
        </button>
      </div>
    </div>
  );
}
