// services/api.js
import { axiosInstance } from '../utils/axiosInstance';
import { useParams } from 'react-router-dom';


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
    validateUser:(identifier) => axiosInstance.post('/login/validate/', identifier ),
    logout: () => axiosInstance.post('/login/logout/'),
    refreshToken: (refreshToken) => axiosInstance.post('/auth/refresh', { refreshToken }),
    forgotPassword: (identifier) => axiosInstance.post('/login/otp-request/', identifier ),
    verifyOtp: (otpData) => axiosInstance.post('/login/verify-otp/', otpData),
    newPasswod: (newPasswordData) => axiosInstance.post('/login/set-new-password/', newPasswordData),
    resetPassword: (resetData) => axiosInstance.post('/login/reset-password/', resetData),
    changePassword: (passwordData) => axiosInstance.post('/login/reset-password/', passwordData),
    updateProfile: (profileData) => axiosInstance.put('/auth/profile/', profileData),
    // validateSession: () => axiosInstance.get('/auth/validate'),
    setup2FA: () => axiosInstance.post('/auth/2fa/setup'),
    verify2FA: (data) => axiosInstance.post('/auth/2fa/verify', data),
  },

  // User endpoints
  user: {
    getByOrganization: (organizationId) => axiosInstance.get(`/user/create-user/?company_id=${organizationId}`),
    getProfile: () => axiosInstance.get('/user/profile/'),
    updateProfile: (data) => axiosInstance.put('/user/profile/', data),
    deleteAccount: () => axiosInstance.delete('/user/account/'),
  },
  visitors:{
    create: (visitorData) => axiosInstance.post('/visitors/visitors/', visitorData),
    getAll: (params) => axiosInstance.get('/visitors/visitors/', { params }),
    update: (visitorId, visitorData) => axiosInstance.put(`/visitors/${visitorId}/`, visitorData),
    delete: (visitorId) => axiosInstance.delete(`/visitors/${visitorId}/`),
    getById: (visitorId) => axiosInstance.get(`/visitors/${visitorId}/`),
    category: () => axiosInstance.get('/visitors/categories/'),
    approve: (visitorId) => axiosInstance.post(`/visitors/visitors/${visitorId}/approval/`,{ action: 'approve' }),
    reject: (visitorId) => axiosInstance.post(`/visitors/${visitorId}/reject/`, { action: 'reject' }),

  },
  // Add this to your existing api object in services/api.js

  // Organization endpoints - ADD THESE TO YOUR EXISTING API OBJECT
  organization: {
    // Get all organizations
    getAll: () => axiosInstance.get('/user/company/'),
        // Get organization by ID
    getById: (id) => axiosInstance.get(`/user/company/${id}/`),
        // Create new organization
    create: (organizationData) => axiosInstance.post('/user/company/', organizationData),
        // Update organization
    companyId: (id) => axiosInstance.get(`/user/company/${id}/`),
    update: (id, organizationData) => axiosInstance.put(`/user/company/${id}/`, organizationData),
        // Delete organization
    delete: (id) => axiosInstance.delete(`/user/company/${id}/`),
        // Check if organization exists (name or email)
    checkExists: (id, checkData) => axiosInstance.post(`/user/company/${id}`, checkData),
        // Add user to organization
    addUser: (userData) => axiosInstance.post('/user/create-user/', userData),
        // Get users for organization
    getUsers: (organizationId) => axiosInstance.get(`/user/create-user/`,organizationId),
        // Update user in organization
    updateUser: ( userId, userData) => 
      axiosInstance.put(`/user/create-user/${userId}/`, userData),
        // Remove user from organization
    deleteUser: (userId) => 
      axiosInstance.delete(`/user/create-user/${userId}/`),
        // Get organization statistics
    getStats: (organizationId) => axiosInstance.get(`/organizations/${organizationId}/stats`),
        // Search organizations
    search: (query) => axiosInstance.get(`/organizations/search?q=${encodeURIComponent(query)}`),
    // Get organizations for current user
    getMy: () => axiosInstance.get('/organizations/my'),
  },

  // Add this to your existing api object in services/api.js

  // Report endpoints - ADD THESE TO YOUR EXISTING API OBJECT
  reports: {
    // Monthly report endpoints
    generateMonthlyExcel: (reportData) => 
      axiosInstance.post('/reports/monthly/excel', reportData, {
        responseType: 'blob', // Important for file downloads
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      }),
    
    generateMonthlyPdf: (reportData) => 
      axiosInstance.post('/reports/monthly/pdf', reportData, {
        responseType: 'blob', // Important for file downloads
        headers: {
          'Accept': 'application/pdf'
        }
      }),

    // Custom report endpoints
    generateCustomExcel: (reportData) => 
      axiosInstance.post('/reports/custom/excel', reportData, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      }),
    
    generateCustomPdf: (reportData) => 
      axiosInstance.post('/reports/custom/pdf', reportData, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      }),

    // Preview report endpoint
    previewReport: (reportData) => 
      axiosInstance.post('/reports/preview', reportData),

    // Alternative endpoints if your API structure is different
    // Generate report with format parameter
    generateReport: (reportData) => 
      axiosInstance.post('/reports/generate', reportData, {
        responseType: reportData.format === 'PDF' ? 'blob' : 'json'
      }),

    // Get report status (for async report generation)
    getReportStatus: (reportId) => 
      axiosInstance.get(`/reports/status/${reportId}`),

    // Download generated report
    downloadReport: (reportId) => 
      axiosInstance.get(`/reports/download/${reportId}`, {
        responseType: 'blob'
      }),

    // Get report history
    getReportHistory: (params) => 
      axiosInstance.get('/reports/history', { params }),

    // Delete report
    deleteReport: (reportId) => 
      axiosInstance.delete(`/reports/${reportId}`),

    // Get available report types
    getReportTypes: () => 
      axiosInstance.get('/reports/types'),

    // Get report templates
    getTemplates: () => 
      axiosInstance.get('/reports/templates'),

    // Schedule report generation
    scheduleReport: (scheduleData) => 
      axiosInstance.post('/reports/schedule', scheduleData),

    // Get scheduled reports
    getScheduledReports: () => 
      axiosInstance.get('/reports/scheduled'),

    // Update scheduled report
    updateScheduledReport: (scheduleId, scheduleData) => 
      axiosInstance.put(`/reports/scheduled/${scheduleId}`, scheduleData),

    // Cancel scheduled report
    cancelScheduledReport: (scheduleId) => 
      axiosInstance.delete(`/reports/scheduled/${scheduleId}`),
  },

  // Add other API endpoints as needed
};

export { setupAxiosInterceptors };