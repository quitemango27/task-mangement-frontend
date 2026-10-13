import { isOverdue } from "./dates";

// Decide how the coach feels, based on the tasks on screen and the streak numbers.
// `stats` comes from the backend and can be null (for example while it is still loading).
export function getMood(tasks, stats) {
  const total = tasks.length;
  if (total === 0) return "welcome";

  const done = tasks.filter((t) => t.completed).length;
  const overdue = tasks.filter(isOverdue).length;

  if (done === total) return "allDone";
  if (overdue > 0) return "overdue";
  if ((stats?.current_streak ?? 0) >= 2) return "streak";
  if (done / total >= 0.6) return "great";
  return "steady";
}

// Which face the avatar should make for each mood.
export const AVATAR_FOR_MOOD = {
  welcome: "wave",
  steady: "thumbsup",
  great: "thumbsup",
  streak: "thumbsup",
  overdue: "determined",
  allDone: "cheer",
};

// Several messages per mood so it doesn't feel repetitive.
export function getMessages(mood, tasks, stats) {
  const overdue = tasks.filter(isOverdue).length;
  const pending = tasks.filter((t) => !t.completed).length;
  const streak = stats?.current_streak ?? 0;
  const today = stats?.completed_today ?? 0;
  const week = stats?.completed_last_7_days ?? 0;

  const lines = {
    welcome: [
      "Hi, I'm Mia! Add your first task and I'll cheer you on.",
      "A clean slate. Add one small task to get started.",
    ],
    steady: [
      `Keep it up, you can do it! ${pending} to go.`,
      "Steady progress is still progress. One task at a time.",
      "You're moving along nicely. Pick the next one and go.",
    ],
    great: [
      `You're on a roll! Only ${pending} left.`,
      "Great pace! Keep that momentum going.",
    ],
    streak:
      today > 0
        ? [
            `${streak}-day streak, and ${today} done today already! Keep it going!`,
            `${streak} days in a row. You're building a real habit!`,
          ]
        : [
            `${streak}-day streak! Finish one task today to keep it alive.`,
            `Don't break your ${streak}-day streak. One small task is enough!`,
          ],
    overdue: [
      `${overdue} task${overdue > 1 ? "s are" : " is"} past the deadline. It happens. Pick the smallest one and start there.`,
      "Deadlines slipped? No problem. Finish one overdue task today and you'll feel the difference.",
      "You've got this. Start with just five minutes on the oldest overdue task.",
    ],
    allDone: [
      "Hurrah! Every single task is done. Time to celebrate!",
      "All clear! You finished everything. Amazing work!",
    ],
  };

  const list = [...lines[mood]];
  // A weekly note joins the steady and great pools once there is something to be proud of
  if (week >= 3 && (mood === "steady" || mood === "great")) {
    list.push(`${week} tasks done this week. That's a lovely rhythm!`);
  }
  if (mood === "allDone" && streak >= 2) {
    list.unshift(`Everything done, and a ${streak}-day streak! Unstoppable!`);
  }
  return list;
}

// Messages for the pop-up shown right after completing a task.
export const CELEBRATE_ONE = [
  "Hurrah! Task complete!",
  "Nice work! One down!",
  "You crushed it!",
  "Well done! Keep going!",
];
export const CELEBRATE_ALL = [
  "Hurrah! Everything is done!",
  "Incredible! You cleared your whole list!",
];

// What she says when you click on her.
export const POKE_LINES = [
  "Hehe, that tickles! You've got this!",
  "Believe in yourself. You're doing great!",
  "One small step at a time. I'm cheering for you!",
  "Sip some water, then back to it, champion!",
  "Mia believes in you. Go get it!",
];
