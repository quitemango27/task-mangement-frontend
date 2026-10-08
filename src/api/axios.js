import axios from "axios";

// One axios instance used by the whole app.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
});

// Before every request: attach the saved login token (if there is one).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// After every response: if the backend says "401 Unauthorized"
// (token expired or invalid), clear the token and go to the login page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthPage = ["/login", "/register"].includes(window.location.pathname);
    if (error.response?.status === 401 && !isAuthPage) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
