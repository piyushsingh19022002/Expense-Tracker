import axios from 'axios';

// Determine the base API URL dynamically, ensuring the /api/v1 routing prefix is appended
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) {
    return 'http://localhost:8000/api/v1';
  }
  // Strip trailing slashes safely
  const cleanUrl = envUrl.replace(/\/+$/, '');
  
  // Guarantee both /api and /v1 segments are present in correct ordering
  const withApi = cleanUrl.includes('/api') ? cleanUrl : `${cleanUrl}/api`;
  return withApi.endsWith('/v1') ? withApi : `${withApi}/v1`;
};

// Initialize Axios client
const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000, // 10s request timeout
  withCredentials: true, // Allow secure cross-domain cookie transmission
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Attach authorization tokens if present (placeholder for authentication integrations)
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Automatically return standard response body mapping from backend
    return response.data;
  },
  (error) => {
    // Standardize error formats for easy consumption in components
    const customError = {
      success: false,
      message: error.response?.data?.message || 'Unable to connect to the server. Please check your internet connection.',
      errors: error.response?.data?.errors || [],
      status: error.response?.status || 500
    };

    return Promise.reject(customError);
  }
);

export default apiClient;
