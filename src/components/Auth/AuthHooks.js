// hooks/useAuth.js
import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import authService from '../services/authService';

// Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser();
          
          // Validate session with server
          const validation = await authService.validateSession();
          
          if (validation.valid) {
            setIsAuthenticated(true);
            setUser(validation.user || currentUser);
          } else {
            // Session invalid, clear data
            await authService.logout('SESSION_INVALID');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Listen to auth service events
  useEffect(() => {
    const handleAuthEvent = (event, data) => {
      switch (event) {
        case 'LOGIN_SUCCESS':
          setIsAuthenticated(true);
          setUser(data.user);
          setAuthError(null);
          break;
        case 'LOGOUT':
          setIsAuthenticated(false);
          setUser(null);
          setAuthError(null);
          break;
        case 'TOKEN_REFRESHED':
          // Token refreshed silently
          break;
        case 'PROFILE_UPDATED':
          setUser(data.user);
          break;
        case 'LOGIN_FAILED':
        case 'PASSWORD_RESET_FAILED':
        case 'REGISTRATION_FAILED':
          setAuthError(data.error);
          break;
        default:
          break;
      }
    };

    const unsubscribe = authService.addAuthListener(handleAuthEvent);
    return unsubscribe;
  }, []);

  const value = {
    isAuthenticated,
    user,
    loading,
    authError,
    setAuthError,
    // Export auth service methods for easy access
    login: authService.login.bind(authService),
    logout: authService.logout.bind(authService),
    register: authService.register.bind(authService),
    updateProfile: authService.updateProfile.bind(authService),
    changePassword: authService.changePassword.bind(authService),
    requestPasswordReset: authService.requestPasswordReset.bind(authService),
    resetPassword: authService.resetPassword.bind(authService),
    hasPermission: authService.hasPermission.bind(authService),
    hasRole: authService.hasRole.bind(authService),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Main useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hook for login functionality
export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();

  const loginUser = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await login(credentials);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [login]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loginUser,
    loading,
    error,
    clearError
  };
};

// Hook for registration functionality
export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();

  const registerUser = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const result = await register(userData);
      setSuccess(true);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [register]);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return {
    registerUser,
    loading,
    error,
    success,
    clearMessages
  };
};

// Hook for password reset functionality
export const usePasswordReset = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { requestPasswordReset, resetPassword } = useAuth();

  const requestReset = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      await requestPasswordReset(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [requestPasswordReset]);

  const confirmReset = useCallback(async (resetData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      await resetPassword(resetData);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [resetPassword]);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return {
    requestReset,
    confirmReset,
    loading,
    error,
    success,
    clearMessages
  };
};

// Hook for profile management
export const useProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { user, updateProfile, changePassword } = useAuth();

  const updateUserProfile = useCallback(async (profileData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const updatedUser = await updateProfile(profileData);
      setSuccess(true);
      return updatedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateProfile]);

  const changeUserPassword = useCallback(async (passwordData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      await changePassword(passwordData);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [changePassword]);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return {
    user,
    updateUserProfile,
    changeUserPassword,
    loading,
    error,
    success,
    clearMessages
  };
};

// Hook for permission-based access control
export const usePermissions = () => {
  const { user, hasPermission, hasRole } = useAuth();

  return {
    user,
    hasPermission,
    hasRole,
    permissions: user?.permissions || [],
    role: user?.role
  };
};

// Hook for session management
export const useSession = () => {
  const [sessionInfo, setSessionInfo] = useState({
    timeRemaining: null,
    isExpiring: false
  });

  useEffect(() => {
    const updateSessionInfo = () => {
      const sessionTimeout = localStorage.getItem('sessionTimeout');
      if (sessionTimeout) {
        const timeRemaining = Math.max(0, parseInt(sessionTimeout) - Date.now());
        const isExpiring = timeRemaining < 300000; // 5 minutes
        
        setSessionInfo({
          timeRemaining,
          isExpiring
        });
      }
    };

    // Update immediately
    updateSessionInfo();
    
    // Update every minute
    const interval = setInterval(updateSessionInfo, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const extendSession = useCallback(async () => {
    try {
      await authService.refreshToken();
      return true;
    } catch (error) {
      console.error('Session extension failed:', error);
      return false;
    }
  }, []);

  return {
    ...sessionInfo,
    extendSession
  };
};

// Hook for auth loading states
export const useAuthLoading = () => {
  const [operations, setOperations] = useState(new Set());

  const startOperation = useCallback((operationId) => {
    setOperations(prev => new Set([...prev, operationId]));
  }, []);

  const endOperation = useCallback((operationId) => {
    setOperations(prev => {
      const newSet = new Set(prev);
      newSet.delete(operationId);
      return newSet;
    });
  }, []);

  const isLoading = operations.size > 0;

  return {
    isLoading,
    startOperation,
    endOperation,
    operations: Array.from(operations)
  };
};