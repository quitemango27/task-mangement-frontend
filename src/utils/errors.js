// Turns a failed API call into a message a person can read.
export function getErrorMessage(err) {
  if (!err.response) {
    return "Cannot reach the server. Is your backend running?";
  }
  const detail = err.response.data?.detail;
  // Normal errors: detail is a string, e.g. "Username already exists"
  if (typeof detail === "string") return detail;
  // Validation errors (422): detail is a list of problems
  if (Array.isArray(detail) && detail[0]?.msg) {
    const field = detail[0].loc?.[detail[0].loc.length - 1];
    return `${field}: ${detail[0].msg}`;
  }
  return "Something went wrong. Please try again.";
}
