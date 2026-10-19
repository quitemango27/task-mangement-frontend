import api from "./axios";

// Asks Mia (the AI) for today's plan. We send the browser's timezone so
// "overdue" and "today" mean the user's own days.
export const getDailyPlan = () =>
  api.post("/ai/daily-plan", null, { params: { tz_offset: new Date().getTimezoneOffset() } });
