import api from "./axios";

// Asks Mia (the AI) for today's plan. We send the browser's timezone so
// "overdue" and "today" mean the user's own days.
export const getDailyPlan = () =>
  api.post("/ai/daily-plan", null, { params: { tz_offset: new Date().getTimezoneOffset() } });

// Asks Mia to split a goal ("Prepare for exam") into small steps. Nothing is saved yet:
// the user reviews the steps first, then they are created as normal tasks.
export const getBreakdown = (title, details = "") => api.post("/ai/breakdown", { title, details });
