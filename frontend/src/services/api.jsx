import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Helper to extract CSRF token from cookies
function getCsrfTokenFromCookie() {
  const name = "XSRF-TOKEN";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(";").shift());
  }
  return null;
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // IMPORTANT: Send cookies (including session ID) with every request
  headers: {
    Accept: "application/json",
    // Note: Don't set Content-Type here - we'll set it per request based on the data type
  },
});

// Store CSRF token in memory
let csrfToken = null;
let sessionInitialized = false;

// Initialize session by fetching CSRF token from backend
async function initializeSession() {
  if (sessionInitialized) return;

  try {
    console.log("Initializing session and fetching CSRF token...");
    // Make a GET request to establish session and receive CSRF token
    const response = await axios.get(`${API_URL}/csrf-token`, {
      withCredentials: true,
    });

    // Try to get token from multiple sources:
    // 1. Response header
    csrfToken =
      response.headers["x-csrf-token"] ||
      // 2. Response body
      response.data?.token ||
      // 3. Cookie
      getCsrfTokenFromCookie();

    sessionInitialized = true;
    console.log(
      "Session initialized, CSRF token obtained:",
      csrfToken ? "✓" : "✗",
    );
  } catch (e) {
    console.warn("Session initialization failed:", e.message);
  }
}

// Refresh CSRF token (call this after login to get a fresh token for the new session)
async function refreshCsrfToken() {
  try {
    console.log("Refreshing CSRF token...");
    const response = await axios.get(`${API_URL}/csrf-token`, {
      withCredentials: true,
    });

    csrfToken =
      response.headers["x-csrf-token"] ||
      response.data?.token ||
      getCsrfTokenFromCookie();

    console.log("CSRF token refreshed:", csrfToken ? "✓" : "✗");
    return csrfToken;
  } catch (e) {
    console.warn("CSRF token refresh failed:", e.message);
    return null;
  }
}

// Request interceptor to include CSRF token and set Content-Type
api.interceptors.request.use(
  async (config) => {
    // Initialize session on first request
    if (!sessionInitialized) {
      await initializeSession();
    }

    // Set Content-Type based on request body type
    if (config.data instanceof FormData) {
      // Don't set Content-Type for FormData - let the browser set it with boundary
      delete config.headers["Content-Type"];
      console.log("FormData request detected - browser will set Content-Type");
    } else if (config.data && typeof config.data === "object") {
      // Set JSON content type for object data
      config.headers["Content-Type"] = "application/json";
    }

    // Add CSRF token for state-changing requests
    if (["post", "put", "patch", "delete"].includes(config.method)) {
      // Try to get fresh token from cookie if memory token is expired
      const token = csrfToken || getCsrfTokenFromCookie();
      if (token) {
        // Add to headers (standard Laravel location)
        config.headers["X-CSRF-TOKEN"] = token;
        // Also add as lowercase variant for compatibility
        config.headers["x-csrf-token"] = token;
        console.log("CSRF token added to request");
      } else {
        console.warn("CSRF token not available");
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
    // Log detailed error information
    if (error.response) {
      console.error("Response error:", {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
    } else if (error.request) {
      console.error("Request error - no response:", error.request);
    } else {
      console.error("Error:", error.message);
    }

    // Log 401 errors but don't auto-logout
    if (error.response?.status === 401) {
      console.warn("401 Unauthorized - request failed:", error.config?.url);
    }
    if (error.response?.status === 419) {
      console.error("419 Token Mismatch - CSRF token may be invalid");
    }
    return Promise.reject(error);
  },
);

export default api;
export { refreshCsrfToken };
