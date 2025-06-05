// services/authService.js
class AuthService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    this.tokenKey = 'authToken';
    this.userKey = 'userProfile';
    this.refreshTokenKey = 'refreshToken';
    this.sessionTimeoutKey = 'sessionTimeout';
    this.listeners = new Set();
    this.sessionTimeout = null;
    this.refreshInterval = null;
    
    // Initialize session monitoring
    this.initializeSessionMonitoring();
  }

  // Event listener management
  addAuthListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Auth listener error:', error);
      }
    });
  }

  // Enhanced login with comprehensive validation
  async login(credentials) {
    try {
      const response = await this.apiCall('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      if (response.success) {
        const { user, token, refreshToken, expiresIn } = response.data;
        
        // Store authentication data
        this.setAuthData(user, token, refreshToken, expiresIn);
        
        // Start session monitoring
        this.startSessionMonitoring(expiresIn);
        
        // Log successful login
        this.logAuthEvent('LOGIN_SUCCESS', { userId: user.id });
        
        this.notifyListeners('LOGIN_SUCCESS', { user, token });
        
        return { success: true, user, token };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      this.logAuthEvent('LOGIN_FAILED', { error: error.message });
      this.notifyListeners('LOGIN_FAILED', { error: error.message });
      throw error;
    }
  }

  // Enhanced logout with cleanup
  async logout(reason = 'USER_INITIATED') {
    try {
      const token = this.getToken();
      
      if (token) {
        // Notify server about logout
        try {
          await this.apiCall('/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (error) {
          console.warn('Server logout notification failed:', error);
        }
      }

      // Clear all authentication data
      this.clearAuthData();
      
      // Stop session monitoring
      this.stopSessionMonitoring();
      
      // Log logout event
      this.logAuthEvent('LOGOUT', { reason });
      
      this.notifyListeners('LOGOUT', { reason });
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Even if server call fails, clear local data
      this.clearAuthData();
      this.stopSessionMonitoring();
      throw error;
    }
  }

  // Token refresh functionality
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem(this.refreshTokenKey);
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.apiCall('/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken })
      });

      if (response.success) {
        const { token, refreshToken: newRefreshToken, expiresIn } = response.data;
        
        // Update tokens
        localStorage.setItem(this.tokenKey, token);
        if (newRefreshToken) {
          localStorage.setItem(this.refreshTokenKey, newRefreshToken);
        }
        
        // Update session timeout
        this.updateSessionTimeout(expiresIn);
        
        this.notifyListeners('TOKEN_REFRESHED', { token });
        
        return token;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout user
      await this.logout('TOKEN_REFRESH_FAILED');
      throw error;
    }
  }

  // User registration
  async register(userData) {
    try {
      const response = await this.apiCall('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      if (response.success) {
        this.logAuthEvent('REGISTRATION_SUCCESS', { userId: response.data.user.id });
        this.notifyListeners('REGISTRATION_SUCCESS', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      this.logAuthEvent('REGISTRATION_FAILED', { error: error.message });
      this.notifyListeners('REGISTRATION_FAILED', { error: error.message });
      throw error;
    }
  }

  // Password reset request
  async requestPasswordReset(email) {
    try {
      const response = await this.apiCall('/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      if (response.success) {
        this.notifyListeners('PASSWORD_RESET_REQUESTED', { email });
        return response.data;
      } else {
        throw new Error(response.message || 'Password reset request failed');
      }
    } catch (error) {
      this.notifyListeners('PASSWORD_RESET_FAILED', { error: error.message });
      throw error;
    }
  }

  // Password reset confirmation
  async resetPassword(resetData) {
    try {
      const response = await this.apiCall('/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resetData)
      });

      if (response.success) {
        this.notifyListeners('PASSWORD_RESET_SUCCESS', {});
        return response.data;
      } else {
        throw new Error(response.message || 'Password reset failed');
      }
    } catch (error) {
      this.notifyListeners('PASSWORD_RESET_FAILED', { error: error.message });
      throw error;
    }
  }

  // Change password (authenticated user)
  async changePassword(passwordData) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await this.apiCall('/auth/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData)
      });

      if (response.success) {
        this.logAuthEvent('PASSWORD_CHANGED', { userId: this.getCurrentUser()?.id });
        this.notifyListeners('PASSWORD_CHANGED', {});
        return response.data;
      } else {
        throw new Error(response.message || 'Password change failed');
      }
    } catch (error) {
      this.notifyListeners('PASSWORD_CHANGE_FAILED', { error: error.message });
      throw error;
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await this.apiCall('/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      });

      if (response.success) {
        const updatedUser = response.data.user;
        
        // Update stored user data
        localStorage.setItem(this.userKey, JSON.stringify(updatedUser));
        
        this.logAuthEvent('PROFILE_UPDATED', { userId: updatedUser.id });
        this.notifyListeners('PROFILE_UPDATED', { user: updatedUser });
        
        return updatedUser;
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error) {
      this.notifyListeners('PROFILE_UPDATE_FAILED', { error: error.message });
      throw error;
    }
  }

  // Validate current session
  async validateSession() {
    try {
      const token = this.getToken();
      if (!token) {
        return { valid: false };
      }

      const response = await this.apiCall('/auth/validate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.success) {
        return { valid: true, user: response.data.user };
      } else {
        return { valid: false };
      }
    } catch (error) {
      console.error('Session validation error:', error);
      return { valid: false };
    }
  }

  // Two-factor authentication setup
  async setupTwoFactor() {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await this.apiCall('/auth/2fa/setup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.success) {
        this.notifyListeners('2FA_SETUP_INITIATED', response.data);
        return response.data;
      } else {
        throw new Error(response.message || '2FA setup failed');
      }
    } catch (error) {
      this.notifyListeners('2FA_SETUP_FAILED', { error: error.message });
      throw error;
    }
  }

  // Verify two-factor authentication
  async verifyTwoFactor(token, code) {
    try {
      const response = await this.apiCall('/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, code })
      });

      if (response.success) {
        const { user, token: authToken, refreshToken, expiresIn } = response.data;
        
        this.setAuthData(user, authToken, refreshToken, expiresIn);
        this.startSessionMonitoring(expiresIn);
        
        this.logAuthEvent('2FA_LOGIN_SUCCESS', { userId: user.id });
        this.notifyListeners('2FA_VERIFIED', { user, token: authToken });
        
        return { success: true, user, token: authToken };
      } else {
        throw new Error(response.message || '2FA verification failed');
      }
    } catch (error) {
      this.notifyListeners('2FA_VERIFICATION_FAILED', { error: error.message });
      throw error;
    }
  }

  // Get current authentication status
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user && !this.isTokenExpired());
  }

  // Get current user
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem(this.userKey);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Get authentication token
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  // Check if token is expired
  isTokenExpired() {
    const sessionTimeout = localStorage.getItem(this.sessionTimeoutKey);
    if (sessionTimeout) {
      return Date.now() > parseInt(sessionTimeout);
    }
    return false;
  }

  // Get user permissions
  getUserPermissions() {
    const user = this.getCurrentUser();
    return user?.permissions || [];
  }

  // Check if user has specific permission
  hasPermission(permission) {
    const permissions = this.getUserPermissions();
    return permissions.includes(permission) || permissions.includes('*');
  }

  // Check if user has any of the specified roles
  hasRole(roles) {
    const user = this.getCurrentUser();
    const userRole = user?.role;
    
    if (Array.isArray(roles)) {
      return roles.includes(userRole);
    }
    return userRole === roles;
  }

  // Session monitoring
  initializeSessionMonitoring() {
    // Check for existing session on initialization
    if (this.isAuthenticated() && !this.isTokenExpired()) {
      const sessionTimeout = localStorage.getItem(this.sessionTimeoutKey);
      if (sessionTimeout) {
        const remainingTime = parseInt(sessionTimeout) - Date.now();
        if (remainingTime > 0) {
          this.startSessionMonitoring(remainingTime / 1000);
        }
      }
    }

    // Listen for storage changes (multiple tabs)
    window.addEventListener('storage', (e) => {
      if (e.key === this.tokenKey || e.key === this.userKey) {
        if (!e.newValue) {
          // Token/user removed in another tab
          this.notifyListeners('LOGOUT', { reason: 'OTHER_TAB' });
        } else if (!e.oldValue) {
          // Token/user added in another tab
          this.notifyListeners('LOGIN_SUCCESS', { 
            user: this.getCurrentUser(), 
            token: this.getToken() 
          });
        }
      }
    });

    // Listen for tab visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isAuthenticated()) {
        // Tab became visible, validate session
        this.validateSession().then(result => {
          if (!result.valid) {
            this.logout('SESSION_INVALID');
          }
        });
      }
    });
  }

  startSessionMonitoring(expiresIn) {
    this.stopSessionMonitoring();

    const expiryTime = Date.now() + (expiresIn * 1000);
    localStorage.setItem(this.sessionTimeoutKey, expiryTime.toString());

    // Set timeout for session expiry
    this.sessionTimeout = setTimeout(() => {
      this.logout('SESSION_EXPIRED');
    }, expiresIn * 1000);

    // Set interval for token refresh (refresh 5 minutes before expiry)
    const refreshTime = Math.max((expiresIn - 300) * 1000, 60000); // At least 1 minute
    this.refreshInterval = setTimeout(() => {
      this.refreshToken().catch(() => {
        // If refresh fails, logout will be called automatically
      });
    }, refreshTime);
  }

  stopSessionMonitoring() {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = null;
    }
    if (this.refreshInterval) {
      clearTimeout(this.refreshInterval);
      this.refreshInterval = null;
    }
    localStorage.removeItem(this.sessionTimeoutKey);
  }

  updateSessionTimeout(expiresIn) {
    const expiryTime = Date.now() + (expiresIn * 1000);
    localStorage.setItem(this.sessionTimeoutKey, expiryTime.toString());
  }

  // Helper methods
  setAuthData(user, token, refreshToken, expiresIn) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    if (refreshToken) {
      localStorage.setItem(this.refreshTokenKey, refreshToken);
    }
    if (expiresIn) {
      this.updateSessionTimeout(expiresIn);
    }
  }

  clearAuthData() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.sessionTimeoutKey);
  }

  // API call wrapper with automatic token handling
  async apiCall(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
        }
      });

      if (response.status === 401) {
        // Token expired or invalid
        throw new Error('Authentication required');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error.message === 'Authentication required') {
        await this.logout('AUTHENTICATION_REQUIRED');
      }
      throw error;
    }
  }

  // Logging for audit trail
  logAuthEvent(event, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      data,
      userAgent: navigator.userAgent,
      ip: 'client-side' // In real app, get from server
    };

    // In production, send to logging service
    console.log('Auth Event:', logEntry);
    
    // Store recent events locally for debugging
    try {
      const logs = JSON.parse(localStorage.getItem('authLogs') || '[]');
      logs.push(logEntry);
      // Keep only last 50 events
      const recentLogs = logs.slice(-50);
      localStorage.setItem('authLogs', JSON.stringify(recentLogs));
    } catch (error) {
      console.error('Error storing auth log:', error);
    }
  }

  // Get authentication logs
  getAuthLogs() {
    try {
      return JSON.parse(localStorage.getItem('authLogs') || '[]');
    } catch (error) {
      console.error('Error getting auth logs:', error);
      return [];
    }
  }

  // Clear authentication logs
  clearAuthLogs() {
    localStorage.removeItem('authLogs');
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;