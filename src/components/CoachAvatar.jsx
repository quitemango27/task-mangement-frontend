import { useEffect, useRef, useState } from "react";

// "Mia", the app's coach: a cute doll-style girl drawn in SVG.
// mood: "wave" | "thumbsup" | "determined" | "cheer"
// interactive: eyes follow the mouse and she blinks (turn off with interactive={false})

const SKIN = "#ffe1cc";
const SKIN_SHADE = "#f0b99b";
const HAIR = "#5a3427";
const HAIR_HI = "#8a5442";
const DRESS = "#8b5cf6";
const DRESS_DARK = "#7c3aed";
const RIBBON = "#f472b6";
const RIBBON_DARK = "#ec4899";
const IRIS = "#7c3aed";
const INK = "#2b1b3d";

export default function CoachAvatar({ mood = "wave", size = 96, className = "", interactive = true }) {
  const ref = useRef(null);
  const [look, setLook] = useState({ x: 0, y: 0 }); // where the eyes are looking
  const [blink, setBlink] = useState(false);

  // Eyes follow the mouse cursor
  useEffect(() => {
    if (!interactive) return;
    let frame = 0;
    const onMove = (e) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height * 0.45);
        const dist = Math.hypot(dx, dy) || 1;
        const strength = Math.min(1, dist / 180); // looks straight ahead when the cursor is close
        setLook({ x: (dx / dist) * 2 * strength, y: (dy / dist) * 1.8 * strength });
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [interactive]);

  // Blink every few seconds
  useEffect(() => {
    if (!interactive) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let t1, t2;
    const schedule = () => {
      t1 = setTimeout(() => {
        setBlink(true);
        t2 = setTimeout(() => {
          setBlink(false);
          schedule();
        }, 140);
      }, 2200 + Math.random() * 3000);
    };
    schedule();
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [interactive]);

  const cheer = mood === "cheer";
  const determined = mood === "determined";
  const thumbs = mood === "thumbsup";
  const wave = mood === "wave";
  const eyesClosed = cheer || blink;

  const sleeve = { stroke: DRESS_DARK, strokeWidth: 10, strokeLinecap: "round", fill: "none" };

  // One eye: white, coloured iris, pupil and two sparkles. (cx, cy) = eye centre.
  const Eye = ({ cx, cy }) => (
    <g>
      <ellipse cx={cx} cy={cy} rx="8.5" ry="10" fill="#fff" />
      <g transform={`translate(${look.x} ${look.y})`}>
        <ellipse cx={cx} cy={cy + 0.5} rx="6.6" ry="8.2" fill={IRIS} />
        <ellipse cx={cx} cy={cy + 1} rx="3.4" ry="4.6" fill={INK} />
        <circle cx={cx + 2.4} cy={cy - 3} r="2.4" fill="#fff" />
        <circle cx={cx - 2.2} cy={cy + 3.4} r="1.2" fill="#fff" />
      </g>
    </g>
  );

  return (
    <svg
      ref={ref}
      viewBox="0 0 140 140"
      width={size}
      height={size}
      role="img"
      aria-label="Mia, your task coach"
      className={`doll ${className}`}
    >
      {/* Sparkles while cheering */}
      {cheer && (
        <g fill="#fbbf24">
          <path d="M14 22 l2.2 5.5 5.5 2.2 -5.5 2.2 -2.2 5.5 -2.2 -5.5 -5.5 -2.2 5.5 -2.2z" />
          <path d="M124 18 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" />
          <path d="M126 66 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5z" />
        </g>
      )}

      {/* ---- Body: neck, dress, collar, arms ---- */}
      <rect x="63" y="90" width="14" height="14" rx="5" fill={SKIN_SHADE} />
      <path d="M30 140 Q32 102 70 98 Q108 102 110 140Z" fill={DRESS} />
      <path d="M56 100 Q70 114 84 100 Q70 106 56 100Z" fill="#fff" />
      {/* little bow on the dress */}
      <path d="M70 114 L61 108 L61 120Z" fill={RIBBON} />
      <path d="M70 114 L79 108 L79 120Z" fill={RIBBON} />
      <circle cx="70" cy="114" r="3" fill={RIBBON_DARK} />

      {/* resting left arm (raised arms are drawn after the head so the hands stay visible) */}
      {!cheer && <path d="M42 112 Q32 124 36 136" {...sleeve} />}
      {!cheer && !wave && !thumbs && !determined && <path d="M98 112 Q108 124 104 136" {...sleeve} />}

      {/* ---- Head (tilts a little when you hover) ---- */}
      <g className="doll-head">
        {/* back of the hair (bob cut) */}
        <path d="M29 70 Q25 24 70 19 Q115 24 111 70 Q113 98 104 106 Q92 98 90 84 L50 84 Q48 98 36 106 Q27 98 29 70Z" fill={HAIR} />

        {/* face */}
        <ellipse cx="70" cy="64" rx="35" ry="32" fill={SKIN} />

        {/* cheeks */}
        <ellipse cx="46" cy="79" rx="6.5" ry="3.8" fill="#fb7185" opacity="0.45" />
        <ellipse cx="94" cy="79" rx="6.5" ry="3.8" fill="#fb7185" opacity="0.45" />

        {/* eyes */}
        {eyesClosed ? (
          <g stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none">
            {cheer ? (
              <>
                <path d="M46 70 Q55 59 64 70" />
                <path d="M76 70 Q85 59 94 70" />
              </>
            ) : (
              <>
                <path d="M47 68 Q55 73 63 68" />
                <path d="M77 68 Q85 73 93 68" />
              </>
            )}
          </g>
        ) : (
          <>
            <Eye cx={55} cy={67} />
            <Eye cx={85} cy={67} />
            {/* upper lashes */}
            <g stroke={INK} strokeWidth="2.6" strokeLinecap="round" fill="none">
              <path d="M46 62 Q55 55 64 62" />
              <path d="M76 62 Q85 55 94 62" />
              <path d="M46 62 L42.5 59" />
              <path d="M94 62 L97.5 59" />
            </g>
          </>
        )}

        {/* eyebrows */}
        <g stroke={HAIR} strokeWidth="2.2" strokeLinecap="round" fill="none">
          {determined ? (
            <>
              <path d="M46 50 L63 56" />
              <path d="M94 50 L77 56" />
            </>
          ) : (
            <>
              <path d="M47 52 Q55 47 63 52" />
              <path d="M77 52 Q85 47 93 52" />
            </>
          )}
        </g>

        {/* nose */}
        <path d="M68.5 76 Q70 78 71.5 76" stroke={SKIN_SHADE} strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* mouth */}
        {cheer ? (
          <g>
            <path d="M59 82 Q70 100 81 82 Z" fill="#9f1239" />
            <path d="M64 90 Q70 96 76 90 Q70 86 64 90Z" fill="#fb7185" />
          </g>
        ) : thumbs ? (
          <path d="M62 83 Q70 93 78 83 Z" fill="#9f1239" />
        ) : determined ? (
          <path d="M64 86 Q70 89 76 86" stroke="#9f3a28" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        ) : (
          <path d="M62 83 Q70 91 78 83" stroke="#9f3a28" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        )}

        {/* fringe (bangs) and side locks */}
        <path d="M32 62 Q33 28 70 25 Q107 28 108 62 Q98 45 86 49 Q78 55 70 45 Q62 55 54 49 Q42 45 32 62Z" fill={HAIR} />
        <path d="M32 62 Q28 86 37 104 Q47 92 47 74 Q39 70 32 62Z" fill={HAIR} />
        <path d="M108 62 Q112 86 103 104 Q93 92 93 74 Q101 70 108 62Z" fill={HAIR} />
        <path d="M50 34 Q66 27 82 33" stroke={HAIR_HI} strokeWidth="3.2" strokeLinecap="round" fill="none" opacity="0.7" />

        {/* hair bow */}
        <path d="M98 30 L84 21 L84 39Z" fill={RIBBON} />
        <path d="M98 30 L112 21 L112 39Z" fill={RIBBON} />
        <circle cx="98" cy="30" r="4.2" fill={RIBBON_DARK} />
      </g>

      {/* ---- Raised arms, in front of the hair ---- */}
      {cheer && (
        <g>
          <path d="M42 110 Q14 102 20 72" {...sleeve} />
          <path d="M98 110 Q126 102 120 72" {...sleeve} />
          <circle cx="20" cy="68" r="6.5" fill={SKIN} />
          <circle cx="120" cy="68" r="6.5" fill={SKIN} />
        </g>
      )}
      {wave && (
        <g className="doll-wave">
          <path d="M98 110 Q124 104 120 78" {...sleeve} />
          <circle cx="120" cy="74" r="6.5" fill={SKIN} />
        </g>
      )}
      {thumbs && (
        <g>
          <path d="M98 110 Q122 104 117 90" {...sleeve} />
          <circle cx="117" cy="87" r="7" fill={SKIN} />
          <rect x="114" y="74" width="6" height="12" rx="3" fill={SKIN} />
        </g>
      )}
      {determined && (
        <g>
          <path d="M98 112 Q122 108 113 94" {...sleeve} />
          <circle cx="112" cy="91" r="7.5" fill={SKIN} />
        </g>
      )}
    </svg>
  );
}
