import axios from 'axios';

// Initialize Axios client
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  timeout: 10000, // 10s request timeout
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
