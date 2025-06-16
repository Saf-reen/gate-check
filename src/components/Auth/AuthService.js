// services/authService.js
import { api, setupAxiosInterceptors } from './api';
import decodeJwtToken from '../utils/jwtDecode';

class AuthService {
  constructor() {
    this.tokenKey = 'authToken';
    this.userKey = 'userProfile';
    this.refreshTokenKey = 'refreshToken';
    this.sessionTimeoutKey = 'sessionTimeout';
    this.listeners = new Set();
    this.sessionTimeout = null;
    this.refreshInterval = null;
    
    // Setup axios interceptors
    setupAxiosInterceptors(this);
    
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
      const response = await api.auth.login(credentials);
      const { user, token, refreshToken, expiresIn } = response.data;
      
      // Decode token to get expiration info if not provided
      let tokenExpiresIn = expiresIn;
      if (!tokenExpiresIn && token) {
        const decoded = decodeJwtToken(token);
        if (decoded && decoded.exp) {
          tokenExpiresIn = decoded.exp - Math.floor(Date.now() / 1000);
        }
      }
      
      // Store authentication data
      this.setAuthData(user, token, refreshToken, tokenExpiresIn);
      
      // Start session monitoring
      if (tokenExpiresIn) {
        this.startSessionMonitoring(tokenExpiresIn);
      }
      
      // Log successful login
      this.logAuthEvent('LOGIN_SUCCESS', { userId: user.id });
      
      this.notifyListeners('LOGIN_SUCCESS', { user, token });
      
      return { success: true, user, token };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      this.logAuthEvent('LOGIN_FAILED', { error: errorMessage });
      this.notifyListeners('LOGIN_FAILED', { error: errorMessage });
      throw new Error(errorMessage);
    }
  }

  // Enhanced logout with cleanup
  async logout(reason = 'USER_INITIATED') {
    try {
      const token = this.getToken();
      
      if (token) {
        // Notify server about logout
        try {
          await api.auth.logout();
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

      const response = await api.auth.refreshToken(refreshToken);
      const { token, refreshToken: newRefreshToken, expiresIn } = response.data;
      
      // Update tokens
      localStorage.setItem(this.tokenKey, token);
      if (newRefreshToken) {
        localStorage.setItem(this.refreshTokenKey, newRefreshToken);
      }
      
      // Update session timeout
      if (expiresIn) {
        this.updateSessionTimeout(expiresIn);
      }
      
      this.notifyListeners('TOKEN_REFRESHED', { token });
      
      return token;
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
      const response = await api.auth.register(userData);
      
      this.logAuthEvent('REGISTRATION_SUCCESS', { userId: response.data.user?.id });
      this.notifyListeners('REGISTRATION_SUCCESS', response.data);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      this.logAuthEvent('REGISTRATION_FAILED', { error: errorMessage });
      this.notifyListeners('REGISTRATION_FAILED', { error: errorMessage });
      throw new Error(errorMessage);
    }
  }

  // Password reset request
  async requestPasswordReset(email) {
    try {
      const response = await api.auth.forgotPassword(email);
      
      this.notifyListeners('PASSWORD_RESET_REQUESTED', { email });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      this.notifyListeners('PASSWORD_RESET_FAILED', { error: errorMessage });
      throw new Error(errorMessage);
    }
  }

  // Password reset confirmation
  async resetPassword(resetData) {
    try {
      const response = await api.auth.resetPassword(resetData);
      
      this.notifyListeners('PASSWORD_RESET_SUCCESS', {});
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      this.notifyListeners('PASSWORD_RESET_FAILED', { error: errorMessage });
      throw new Error(errorMessage);
    }
  }

  // Change password (authenticated user)
  async changePassword(passwordData) {
    try {
      const response = await api.auth.changePassword(passwordData);
      
      this.logAuthEvent('PASSWORD_CHANGED', { userId: this.getCurrentUser()?.id });
      this.notifyListeners('PASSWORD_CHANGED', {});
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      this.notifyListeners('PASSWORD_CHANGE_FAILED', { error: errorMessage });
      throw new Error(errorMessage);
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await api.auth.updateProfile(profileData);
      const updatedUser = response.data.user;
      
      // Update stored user data
      localStorage.setItem(this.userKey, JSON.stringify(updatedUser));
      
      this.logAuthEvent('PROFILE_UPDATED', { userId: updatedUser.id });
      this.notifyListeners('PROFILE_UPDATED', { user: updatedUser });
      
      return updatedUser;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      this.notifyListeners('PROFILE_UPDATE_FAILED', { error: errorMessage });
      throw new Error(errorMessage);
    }
  }

  // Validate current session
  async validateSession() {
    try {
      const token = this.getToken();
      if (!token) {
        return { valid: false };
      }

      const response = await api.auth.validateSession();
      return { valid: true, user: response.data.user };
    } catch (error) {
      console.error('Session validation error:', error);
      return { valid: false };
    }
  }

  // Two-factor authentication setup
  async setupTwoFactor() {
    try {
      const response = await api.auth.setup2FA();
      
      this.notifyListeners('2FA_SETUP_INITIATED', response.data);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      this.notifyListeners('2FA_SETUP_FAILED', { error: errorMessage });
      throw new Error(errorMessage);
    }
  }

  // Verify two-factor authentication
  async verifyTwoFactor(token, code) {
    try {
      const response = await api.auth.verify2FA({ token, code });
      const { user, token: authToken, refreshToken, expiresIn } = response.data;
      
      this.setAuthData(user, authToken, refreshToken, expiresIn);
      if (expiresIn) {
        this.startSessionMonitoring(expiresIn);
      }
      
      this.logAuthEvent('2FA_LOGIN_SUCCESS', { userId: user.id });
      this.notifyListeners('2FA_VERIFIED', { user, token: authToken });
      
      return { success: true, user, token: authToken };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      this.notifyListeners('2FA_VERIFICATION_FAILED', { error: errorMessage });
      throw new Error(errorMessage);
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
    const token = this.getToken();
    if (!token) return true;

    try {
      const decoded = decodeJwtToken(token);
      if (decoded && decoded.exp) {
        return Date.now() >= decoded.exp * 1000;
      }
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }

    // Fallback to session timeout
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
      const token = this.getToken();
      const decoded = decodeJwtToken(token);
      
      if (decoded && decoded.exp) {
        const remainingTime = decoded.exp - Math.floor(Date.now() / 1000);
        if (remainingTime > 0) {
          this.startSessionMonitoring(remainingTime);
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

  // Logging for audit trail
  logAuthEvent(event, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      data,
      userAgent: navigator.userAgent,
      ip: 'client-side'
    };

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