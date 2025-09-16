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
        // try {
        //   const refreshToken = localStorage.getItem('refreshToken');
        //   if (refreshToken) {
        //     // const refreshResponse = await axiosInstance.post('/auth/refresh', {
        //     //   refreshToken: refreshToken
        //     // });
        //     const { token, refreshToken: newRefreshToken } = refreshResponse.data;
        //     localStorage.setItem('authToken', token);
        //     if (newRefreshToken) {
        //       localStorage.setItem('refreshToken', newRefreshToken);
        //     }
        //     // Update the original request with new token
        //     originalRequest.headers.Authorization = `Bearer ${token}`;
        //     return axiosInstance(originalRequest);
        //   }
        // } catch (refreshError) {
        //   // Refresh failed, logout user
        //   authService?.logout('TOKEN_REFRESH_FAILED');
        //   return Promise.reject(refreshError);
        // }
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
    validateUser: (identifier) => axiosInstance.post('/login/validate/', identifier),
    logout: () => axiosInstance.post('/login/logout/'),
    // refreshToken: (refreshToken) => axiosInstance.post('/auth/refresh', { refreshToken }),
    refreshView: () => axiosInstance.get('/api/auth/refresh/'),
    forgotPassword: (identifier) => axiosInstance.post('/login/otp-request/', identifier),
    verifyOtp: (otpData) => axiosInstance.post('/login/verify-otp/', otpData),
    newPasswod: (newPasswordData) => axiosInstance.post('/login/set-new-password/', newPasswordData),
    resetPassword: (resetData) => axiosInstance.post('/login/reset-password/', resetData),
    changePassword: (passwordData) => axiosInstance.post('/login/reset-password/', passwordData),
    updateProfile: (profileData) => axiosInstance.put('/auth/profile/', profileData),
    setup2FA: () => axiosInstance.post('/auth/2fa/setup'),
    verify2FA: (data) => axiosInstance.post('/auth/2fa/verify', data),
  },
  // User endpoints
  user: {
    getByOrganization: (organizationId) => axiosInstance.get(`/user/create-user/?company_id=${organizationId}`),
    getProfile: () => axiosInstance.get('/user/profile/'),
    updateProfile: (data) => axiosInstance.put('/user/profile/', data),
    // deleteAccount: () => axiosInstance.delete('/user/account/'),
  },
  visitors: {
    create: (visitorData) => axiosInstance.post('/visitors/visitors/', visitorData),
    getAll: ({ companyId, ...params }) => axiosInstance.get(`visitors/company/${companyId}/visitors/`, { params }),
    getRecurring: (params) => axiosInstance.get('/visitors/filter/?pass_type=recurring   ', { params }),
    update: (visitorId, visitorData) => axiosInstance.put(`/visitors/${visitorId}/`, visitorData),
    delete: (visitorId) => axiosInstance.delete(`/visitors/${visitorId}/`),
    getById: (visitorId) => axiosInstance.get(`/visitors/${visitorId}/`),
    category: () => axiosInstance.get('/visitors/categories/'),
    approve: (visitorId) => axiosInstance.post(`/visitors/visitors/${visitorId}/approval/`, { action: 'approve' }),
    reject: (visitorId) => axiosInstance.post(`/visitors/visitors/${visitorId}/reject/`, { action: 'reject' }),
    createRecurring: (visitorData) => axiosInstance.post('/visitors/visitors/', visitorData),
    filterStatus: (params) => axiosInstance.get('/visitors/filter/', { params }),
    filterPassType: (params) => axiosInstance.get(`/visitors/filter/?pass_type=${params.pass_type}`, { params }),
    checkin: (visitorId) => axiosInstance.post(`/visitors/visitors/${visitorId}/entry-exit/`, { action: 'entry' }),
    checkout: (visitorId) => axiosInstance.post(`/visitors/visitors/${visitorId}/entry-exit/`, { action: 'exit' }),
    getQR: (visitorId) => axiosInstance.get(`/visitors/visitors/${visitorId}/`),
    reschedule: (visitorId, payload) => axiosInstance.post(`/visitors/visitors/${visitorId}/reschedule/`, payload),
    verifyEntryOtp: (passId, payload) => axiosInstance.post(`/visitors/visitors/${passId}/entry-exit/`, payload),
    verifyExitOtp: (passId, payload) => axiosInstance.post(`/visitors/visitors/${passId}/entry-exit/`,payload),
  },
  // Organization endpoints
  organization: {
    roles: () => axiosInstance.get('/roles/create'),
    getAll: () => axiosInstance.get('/user/company/'),
    getById: (id) => axiosInstance.get(`/user/company/${id}/`),
    create: (organizationData) => axiosInstance.post('/user/company/', organizationData),
    companyId: (id) => axiosInstance.get(`/user/company/${id}/`),
    update: (id, organizationData) => axiosInstance.put(`/user/company/${id}/`, organizationData),
    delete: (id) => axiosInstance.delete(`/user/company/${id}/`),
    checkExists: (id, checkData) => axiosInstance.post(`/user/company/${id}`, checkData),
    addUser: (userData) => axiosInstance.post('/user/create-user/', userData),
    getUsers: (organizationId) => axiosInstance.get(`/user/create-user/`, organizationId),
    updateUser: (userId, userData) => axiosInstance.put(`/user/create-user/${userId}/`, userData),
    deleteUser: (userId) => axiosInstance.delete(`/user/create-user/${userId}/`),
    getStats: (organizationId) => axiosInstance.get(`/organizations/${organizationId}/stats`),
    search: (query) => axiosInstance.get(`/organizations/search?q=${encodeURIComponent(query)}`),
    getMy: () => axiosInstance.get('/organizations/my'),
  },
  roles:{
    getAll: () => axiosInstance.get('/roles/create/'),
    create: (roleData) => axiosInstance.post('/roles/create/', roleData),
    update: (roleId, roleData) => axiosInstance.put(`/roles/role/${roleId}/`, roleData),
    delete: (roleId) => axiosInstance.delete(`/roles/role/${roleId}/`, ),
    getById: (roleId) => axiosInstance.get(`/roles/role/${roleId}/`),
  },
  permissions:{
    getAll: () => axiosInstance.get('/roles/permissions/'),
    create: (permissionData) => axiosInstance.post('/roles/permissions/', permissionData),
    update: (permissionId, permissionData) => axiosInstance.put(`/roles/permissions/${permissionId}/`, permissionData),
    delete: (permissionId) => axiosInstance.delete(`/roles/permissions/${permissionId}/`),
    getById: (permissionId) => axiosInstance.get(`/roles/permissions/${permissionId}/`),
  },
  rolePermissions: {
    getAll: () => axiosInstance.get('/roles/assign-permissions/'),
    create: (rolePermissionData) => axiosInstance.post('/roles/assign-permissions/', rolePermissionData),
    update: (rolePermissionId, rolePermissionData) => axiosInstance.put(`/roles/assign-permissions/${rolePermissionId}/`, rolePermissionData),
    delete: (rolePermissionId) => axiosInstance.delete(`/roles/assign-permissions/${rolePermissionId}/`),
    getById: (rolePermissionId) => axiosInstance.get(`/roles/assign-permissions/${rolePermissionId}/`),
  },
  userRoles: {
    getAll: () => axiosInstance.get('/roles/user_role/'),
    create: (userRoleData) => axiosInstance.post('/roles/user_role/', userRoleData),
    update: (userRoleId, userRoleData) => axiosInstance.put(`/roles/user_role/${userRoleId}/`, userRoleData),
    delete: (userRoleId, userRoleData) => axiosInstance.delete(`/roles/user_role/${userRoleId}/`, userRoleData),
    getById: (userRoleId) => axiosInstance.get(`/roles/user_role/${userRoleId}/`),
  },
  
  categories: {
    getAll: () => axiosInstance.get('/visitors/categories/'),
    create: (visitorData) => axiosInstance.post('/visitors/categories/',visitorData) ,
    update: (visitorId, visitorData) => axiosInstance.put(`/visitors/categories/${visitorId}/`,visitorData),
    delete: (visitorId) => axiosInstance.delete(`/visitors/categories/${visitorId}/`),
    getById: (visitorId) => axiosInstance.get(`visitors/categories/${visitorId}`),
  },
  // Report endpoints
  reports: {
    generateMonthlyExcel: (reportData) => {
      const queryString = new URLSearchParams({
        year: reportData.year,
        month: reportData.month,
      }).toString();

      return axiosInstance.get(`/reports/monthly-visitor-excel/?${queryString}`, {
        responseType: 'blob',
        headers: {
          Accept: '*/*',
        },
      });
    },
    generateMonthlyPdf: (reportData) => {
      const queryString = new URLSearchParams({
        year: reportData.year,
        month: reportData.month,
      }).toString();

      return axiosInstance.get(`/reports/monthly-visitor-pdf/?${queryString}`, {
        responseType: 'blob',
        headers: {
          Accept: '*/*',
        },
      });
    },
    previewMonthlyReport: (reportData) => {
      const queryString = new URLSearchParams({
        year: reportData.year,
        month: reportData.month,
      }).toString();

      return axiosInstance.get(`/reports/monthly-visitor-pdf/?${queryString}&preview=true`, {
        responseType: 'blob',
        headers: {
          Accept: '*/*',
        },
      });
    },
    generateCustomExcel: (reportData) => {
      const queryString = new URLSearchParams({
        from_date: reportData.fromDate,
        to_date: reportData.toDate,
      }).toString();

      return axiosInstance.get(`/reports/download-visitor-report/?${queryString}`, {
        responseType: 'blob',
        headers: {
          Accept: '*/*',
        },
      });
    },
    generateCustomPdf: (reportData) => {
      const queryString = new URLSearchParams({
        from_date: reportData.fromDate,
        to_date: reportData.toDate,
      }).toString();

      return axiosInstance.get(`/reports/export-pdf/?${queryString}`, {
        responseType: 'blob',
        headers: {
          Accept: '*/*',
        },
      });
    },
    previewReport: (reportData) => {
      const queryString = new URLSearchParams({
        from_date: reportData.fromDate,
        to_date: reportData.toDate,
      }).toString();

      return axiosInstance.get(`/reports/export-pdf/?${queryString}&preview=true`, {
        responseType: 'blob',
        headers: {
          Accept: '*/*',
        },
      });
    },
    // previewReport: (reportData) => axiosInstance.post('/reports/preview', reportData),
    generateReport: (reportData) => axiosInstance.post('/reports/generate', reportData, {
      responseType: reportData.format === 'PDF' ? 'blob' : 'json'
    }),
    getReportStatus: (reportId) => axiosInstance.get(`/reports/status/${reportId}`),
    downloadReport: (reportId) => axiosInstance.get(`/reports/download/${reportId}`, {
      responseType: 'blob'
    }),
    getReportHistory: (params) => axiosInstance.get('/reports/history', { params }),
    deleteReport: (reportId) => axiosInstance.delete(`/reports/${reportId}`),
    getReportTypes: () => axiosInstance.get('/reports/types'),
    getTemplates: () => axiosInstance.get('/reports/templates'),
    scheduleReport: (scheduleData) => axiosInstance.post('/reports/schedule', scheduleData),
    getScheduledReports: () => axiosInstance.get('/reports/scheduled'),
    updateScheduledReport: (scheduleId, scheduleData) => axiosInstance.put(`/reports/scheduled/${scheduleId}`, scheduleData),
    cancelScheduledReport: (scheduleId) => axiosInstance.delete(`/reports/scheduled/${scheduleId}`),
  },
};

export { setupAxiosInterceptors };
