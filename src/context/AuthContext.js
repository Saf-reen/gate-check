import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../components/Auth/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [effectivePermissions, setEffectivePermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication status
  const checkAuthStatus = useCallback(() => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('demoAuthToken');
      const savedUser = localStorage.getItem('userProfile');
      const tokenExpiry = localStorage.getItem('tokenExpiry');

      if (token && savedUser) {
        if (!tokenExpiry || new Date().getTime() < parseInt(tokenExpiry)) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setIsAuthenticated(true);
          return true;
        }
      }
      
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }
  }, []);

  // Fetch user roles from profile or user data
  const fetchUserRoles = useCallback(async () => {
    if (!user) return [];

    try {
      // First try to get from user object
      if (user.role) {
        return [user.role];
      }

      // Try to fetch from user roles API if available
      if (api.userRoles?.getByUserId) {
        const response = await api.userRoles.getByUserId(user.id);
        return response.data?.roles || [];
      }

      // Fallback to profile role
      return user.role ? [user.role] : [];
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return user.role ? [user.role] : [];
    }
  }, [user]);

  // Fetch roles, permissions, and role-permission mappings
  const fetchRolesAndPermissions = useCallback(async () => {
    try {
      const [rolesResponse, permissionsResponse, rolePermissionsResponse] = await Promise.all([
        api.roles.getAll().catch(() => ({ data: [] })),
        api.permissions.getAll().catch(() => ({ data: [] })),
        api.rolePermissions.getAll().catch(() => ({ data: [] }))
      ]);

      const rolesData = rolesResponse.data || [];
      const permissionsData = permissionsResponse.data || [];
      const rolePermissionsData = rolePermissionsResponse.data || [];

      setRoles(rolesData);
      setPermissions(permissionsData);
      setRolePermissions(rolePermissionsData);

      return { rolesData, permissionsData, rolePermissionsData };
    } catch (error) {
      console.error('Error fetching roles and permissions:', error);
      setError('Failed to load permissions data');
      return { rolesData: [], permissionsData: [], rolePermissionsData: [] };
    }
  }, []);

  // Calculate effective permissions for user
  const calculateEffectivePermissions = useCallback((userRoles, rolePermissions, permissions) => {
    if (!userRoles.length || !rolePermissions.length || !permissions.length) {
      return [];
    }

    const effectivePermissionIds = new Set();

    // For each user role, find associated permissions
    userRoles.forEach(userRole => {
      rolePermissions.forEach(rolePermission => {
        // Handle different possible data structures
        const roleMatch = 
          rolePermission.role === userRole ||
          rolePermission.role_name === userRole ||
          (typeof rolePermission.role === 'object' && rolePermission.role.name === userRole);

        if (roleMatch) {
          // Handle different permission data structures
          if (Array.isArray(rolePermission.permission)) {
            rolePermission.permission.forEach(permId => {
              effectivePermissionIds.add(permId);
            });
          } else if (rolePermission.permission_id) {
            effectivePermissionIds.add(rolePermission.permission_id);
          } else if (rolePermission.permission) {
            effectivePermissionIds.add(rolePermission.permission);
          }
        }
      });
    });

    // Convert permission IDs to permission objects/names
    const effectivePerms = permissions.filter(permission => {
      return effectivePermissionIds.has(permission.permission_id) ||
             effectivePermissionIds.has(permission.id) ||
             effectivePermissionIds.has(permission.name);
    });

    return effectivePerms.map(p => p.name || p.permission_name || p.id);
  }, []);

  // Initialize auth data
  const initializeAuth = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if user is authenticated
      const isAuth = checkAuthStatus();
      if (!isAuth) {
        setIsLoading(false);
        return;
      }

      // Fetch roles and permissions data
      const { rolesData, permissionsData, rolePermissionsData } = await fetchRolesAndPermissions();

      // Fetch user roles
      const userRolesList = await fetchUserRoles();
      setUserRoles(userRolesList);

      // Calculate effective permissions
      const effectivePerms = calculateEffectivePermissions(
        userRolesList, 
        rolePermissionsData, 
        permissionsData
      );
      setEffectivePermissions(effectivePerms);

      console.log('Auth initialized:', {
        user: user?.name || user?.username,
        userRoles: userRolesList,
        effectivePermissions: effectivePerms
      });

    } catch (error) {
      console.error('Error initializing auth:', error);
      setError('Failed to initialize authentication');
    } finally {
      setIsLoading(false);
    }
  }, [user, checkAuthStatus, fetchRolesAndPermissions, fetchUserRoles, calculateEffectivePermissions]);

  // Login function
  const login = useCallback(async (userData, token) => {
    try {
      const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('userProfile', JSON.stringify(userData));
      localStorage.setItem('tokenExpiry', expiryTime.toString());
      
      setUser(userData);
      setIsAuthenticated(true);
      
      // Initialize auth data after login
      await initializeAuth();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, [initializeAuth]);

  // Logout function
  const logout = useCallback(() => {
    const authKeys = [
      'authToken',
      'demoAuthToken', 
      'userProfile',
      'tokenExpiry',
      'refreshToken'
    ];
    
    authKeys.forEach(key => localStorage.removeItem(key));
    
    setUser(null);
    setUserRoles([]);
    setEffectivePermissions([]);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  // Update user profile
  const updateUserProfile = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('userProfile', JSON.stringify(updatedUser));
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Re-initialize when user changes
  useEffect(() => {
    if (user && isAuthenticated) {
      initializeAuth();
    }
  }, [user?.id, isAuthenticated]);

  const contextValue = {
    // User data
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Roles and permissions
    userRoles,
    effectivePermissions,
    roles,
    permissions,
    rolePermissions,
    
    // Functions
    login,
    logout,
    updateUserProfile,
    checkAuthStatus,
    initializeAuth
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};