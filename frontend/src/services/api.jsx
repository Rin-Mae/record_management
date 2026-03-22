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
  withCredentials: true, // IMPORTANT: Send cookies with every request
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Track if we've fetched CSRF cookie this session
let csrfInitialized = false;

// Initialize CSRF on first API call to establish session
async function initializeCsrf() {
  if (csrfInitialized) return;

  try {
    console.log("Initializing CSRF cookie...");
    await axios.get(`${API_URL}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });
    csrfInitialized = true;
    console.log("CSRF cookie initialized");
  } catch (e) {
    console.warn("CSRF cookie fetch failed:", e.message);
  }
}

// Request interceptor for CSRF token
api.interceptors.request.use(
  async (config) => {
    // Ensure CSRF cookie is fetched on first request
    if (!csrfInitialized) {
      await initializeCsrf();
    }

    // Add XSRF token header for mutation requests
    if (["post", "put", "patch", "delete"].includes(config.method)) {
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
    // Log 401 errors but don't auto-logout
    // Let each component handle auth errors appropriately
    if (error.response?.status === 401) {
      console.warn("401 Unauthorized - request failed:", error.config?.url);
    }
    return Promise.reject(error);
  },
);

export default api;
