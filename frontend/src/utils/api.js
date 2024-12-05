import axios from 'axios';

// Create a separate instance for token refresh to avoid circular dependencies
const refreshApi = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Custom event for auth state changes
export const authEvents = {
  onTokenRefreshed: (tokens) => {
    window.dispatchEvent(new CustomEvent('tokenRefreshed', { detail: tokens }));
  },
  onAuthError: () => {
    window.dispatchEvent(new CustomEvent('authError'));
  }
};

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await refreshApi.post('/token/refresh/', {
            refresh: refreshToken
          });
          
          const { tokens } = response.data;
          localStorage.setItem('access_token', tokens.access);
          
          // Notify about token refresh
          authEvents.onTokenRefreshed(tokens);
          
          originalRequest.headers.Authorization = `Bearer ${tokens.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh fails, notify about auth error
          authEvents.onAuthError();
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api; 