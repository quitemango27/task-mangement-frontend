import { useEffect, useRef, useState } from "react";
import CoachAvatar from "./CoachAvatar";
import { POKE_LINES } from "../utils/coach";

const STYLES = {
  overdue: "bg-amber-50 ring-1 ring-amber-200",
  allDone: "bg-primary-fixed",
  great: "bg-emerald-50 ring-1 ring-emerald-200",
  streak: "bg-orange-50 ring-1 ring-orange-200",
  steady: "bg-surface-container-lowest shadow-sm",
  welcome: "bg-surface-container-lowest shadow-sm",
};

// The coach on the dashboard. Click her for a surprise.
export default function CoachCard({ mood, avatarMood, message }) {
  const [poke, setPoke] = useState(null); // {id, text} while she is reacting to a click
  const [hearts, setHearts] = useState([]);
  const timer = useRef();

  useEffect(() => () => clearTimeout(timer.current), []);

  const handlePoke = () => {
    const text = POKE_LINES[Math.floor(Math.random() * POKE_LINES.length)];
    const id = Date.now();
    setPoke({ id, text });
    setHearts(
      Array.from({ length: 4 }, (_, i) => ({ id: `${id}-${i}`, left: 10 + i * 20 + Math.random() * 10, delay: i * 0.1 }))
    );
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setPoke(null);
      setHearts([]);
    }, 3200);
  };

  return (
    <div
      role="status"
      data-testid="coach-card"
      data-mood={mood}
      className={`flex items-center gap-4 p-4 rounded-2xl ${STYLES[mood] ?? STYLES.steady}`}
    >
      <button
        type="button"
        onClick={handlePoke}
        aria-label="Cheer me up"
        title="Click me!"
        data-testid="coach-poke"
        className="relative shrink-0 rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container"
      >
        {/* key restarts the jump animation on every click */}
        <span key={poke?.id ?? "idle"} className={`block ${poke ? "coach-jump" : "coach-float"}`}>
          <CoachAvatar mood={poke ? "cheer" : avatarMood} size={92} />
        </span>
        {hearts.map((h) => (
          <span key={h.id} aria-hidden="true" className="heart-float text-xl" style={{ left: `${h.left}%`, top: "4px", animationDelay: `${h.delay}s` }}>
            ♥
          </span>
        ))}
      </button>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Mia, your coach</p>
        <p className="mt-0.5 font-display text-lg font-semibold leading-snug">{poke ? poke.text : message}</p>
      </div>
    </div>
  );
}
