import { isOverdue } from "./dates";

// Decide how the coach feels, based on the tasks on screen.
export function getMood(tasks) {
  const total = tasks.length;
  if (total === 0) return "welcome";

  const done = tasks.filter((t) => t.completed).length;
  const overdue = tasks.filter(isOverdue).length;

  if (done === total) return "allDone";
  if (overdue > 0) return "overdue";
  if (done / total >= 0.6) return "great";
  return "steady";
}

// Which face the avatar should make for each mood.
export const AVATAR_FOR_MOOD = {
  welcome: "wave",
  steady: "thumbsup",
  great: "thumbsup",
  overdue: "determined",
  allDone: "cheer",
};

// Several messages per mood so it doesn't feel repetitive.
export function getMessages(mood, tasks) {
  const overdue = tasks.filter(isOverdue).length;
  const pending = tasks.filter((t) => !t.completed).length;

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
  return lines[mood];
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
