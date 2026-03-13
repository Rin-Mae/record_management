import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Helper to get cookie value
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Track if we've fetched CSRF cookie this session
let csrfInitialized = false;

// Request interceptor for CSRF token
api.interceptors.request.use(
  async (config) => {
    // Get CSRF cookie once for mutation requests
    if (["post", "put", "patch", "delete"].includes(config.method)) {
      if (!csrfInitialized) {
        try {
          await axios.get(`${API_URL}/sanctum/csrf-cookie`, {
            withCredentials: true,
          });
          csrfInitialized = true;
        } catch (e) {
          console.warn("CSRF cookie fetch failed:", e);
        }
      }

      // Read XSRF token from cookie and add to header
      const token = getCookie("XSRF-TOKEN");
      if (token) {
        config.headers["X-XSRF-TOKEN"] = decodeURIComponent(token);
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear user state on unauthorized
      if (typeof window !== "undefined") {
        window.__appUser = null;
      }
    }
    return Promise.reject(error);
  },
);

export default api;
