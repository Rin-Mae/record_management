import axios from 'axios';

// Create axios instance with backend URL
const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true, // Enable cookies for session auth
  headers: {
    // DO NOT set default Content-Type here - let axios auto-detect for FormData
    'X-Requested-With': 'XMLHttpRequest',
  }
});

// Function to get CSRF token from the backend
const fetchCsrfToken = async () => {
  try {
    const response = await axios.get('http://localhost:8000/csrf-token', {
      withCredentials: true,
    });
    const token = response.data.token;
    console.log('CSRF token fetched successfully');
    return token;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
};

// Store the token
let csrfToken = null;

// Initialize CSRF token immediately
fetchCsrfToken().then((token) => {
  if (token) {
    csrfToken = token;
    apiClient.defaults.headers.common['X-CSRF-TOKEN'] = token;
    // DO NOT set default Content-Type - let axios auto-detect based on data
    // For JSON requests, axios will auto-set application/json
    // For FormData, axios will auto-set multipart/form-data with boundary
    console.log('CSRF token initialized');
  }
});

// Request interceptor to add CSRF token
apiClient.interceptors.request.use(async (config) => {
  // If we don't have a token, fetch it
  if (!csrfToken) {
    csrfToken = await fetchCsrfToken();
  }
  
  if (csrfToken) {
    config.headers['X-CSRF-TOKEN'] = csrfToken;
  }
  
  // CRITICAL: For FormData requests, explicitly prevent Content-Type override
  // This is essential for multipart/form-data with proper boundary detection
  if (config.data instanceof FormData) {
    // Completely remove any Content-Type header
    delete config.headers['Content-Type'];
    
    // Also ensure we don't have it in the defaults
    const defaultHeaders = apiClient.defaults.headers;
    if (defaultHeaders.common && defaultHeaders.common['Content-Type']) {
      delete defaultHeaders.common['Content-Type'];
    }
    if (defaultHeaders.post && defaultHeaders.post['Content-Type']) {
      delete defaultHeaders.post['Content-Type'];
    }
    
    console.log('✓ FormData request - Content-Type headers cleared');
    console.log('Request will use automatic multipart/form-data with boundary');
  } else {
    // For JSON requests, explicitly set Content-Type
    config.headers['Content-Type'] = 'application/json';
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle 419 (CSRF token expired)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 419 Unprocessable Entity (CSRF token mismatch) or 422 with CSRF error
    if ((error.response?.status === 419 || error.response?.status === 422) && !originalRequest._retry) {
      // Check if it's a CSRF error
      const isCsrfError = error.response?.data?.message?.includes('CSRF') || 
                         error.response?.status === 419;
      
      if (isCsrfError) {
        console.warn('CSRF token mismatch detected, refreshing token...');
        originalRequest._retry = true;
        
        // Fetch new CSRF token
        csrfToken = await fetchCsrfToken();
        
        if (csrfToken) {
          originalRequest.headers['X-CSRF-TOKEN'] = csrfToken;
          console.log('CSRF token refreshed, retrying request...');
          return apiClient(originalRequest);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;


