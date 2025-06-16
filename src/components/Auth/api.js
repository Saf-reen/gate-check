// services/api.js
import { axiosInstance } from '../utils/axiosInstance';

// Enhanced axios instance with interceptors
const setupAxiosInterceptors = (authService) => {
  // Request interceptor to add auth token
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle token refresh
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            const refreshResponse = await axiosInstance.post('/auth/refresh', {
              refreshToken: refreshToken
            });

            const { token, refreshToken: newRefreshToken } = refreshResponse.data;
            localStorage.setItem('authToken', token);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }

            // Update the original request with new token
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, logout user
          authService?.logout('TOKEN_REFRESH_FAILED');
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

// API endpoints
export const api = {
  // Authentication endpoints
  auth: {
    login: (credentials) => axiosInstance.post('/login/login/', credentials),
    register: (userData) => axiosInstance.post('/user/create-user', userData),
    logout: () => axiosInstance.post('/auth/logout'),
    refreshToken: (refreshToken) => axiosInstance.post('/auth/refresh', { refreshToken }),
    forgotPassword: (email) => axiosInstance.post('/auth/forgot-password', { email }),
    resetPassword: (resetData) => axiosInstance.post('/auth/reset-password', resetData),
    changePassword: (passwordData) => axiosInstance.post('/auth/change-password', passwordData),
    updateProfile: (profileData) => axiosInstance.put('/auth/profile', profileData),
    validateSession: () => axiosInstance.get('/auth/validate'),
    setup2FA: () => axiosInstance.post('/auth/2fa/setup'),
    verify2FA: (data) => axiosInstance.post('/auth/2fa/verify', data),
  },

  // User endpoints
  user: {
    getProfile: () => axiosInstance.get('/user/profile'),
    updateProfile: (data) => axiosInstance.put('/user/profile', data),
    deleteAccount: () => axiosInstance.delete('/user/account'),
  },

  // Add other API endpoints as needed
};

export { setupAxiosInterceptors };