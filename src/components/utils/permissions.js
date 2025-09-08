// Permission constants - define all permissions in your system
export const PERMISSIONS = {
  // Dashboard permissions
  VIEW_DASHBOARD: 'view_dashboard',
  
  // GateCheck permissions
  VIEW_GATECHECK: 'view_gatecheck',
  ADD_VISITOR: 'add_visitor',
  EDIT_VISITOR: 'edit_visitor',
  DELETE_VISITOR: 'delete_visitor',
  APPROVE_VISITOR: 'approve_visitor',
  REJECT_VISITOR: 'reject_visitor',
  
  // Organization permissions
  VIEW_ORGANIZATION: 'view_organization',
  ADD_ORGANIZATION: 'add_organization',
  EDIT_ORGANIZATION: 'edit_organization',
  DELETE_ORGANIZATION: 'delete_organization',
  
  // User management permissions
  VIEW_USERS: 'view_users',
  ADD_USER: 'add_user',
  EDIT_USER: 'edit_user',
  DELETE_USER: 'delete_user',
  
  // Role management permissions
  VIEW_ROLES: 'view_roles',
  ADD_ROLE: 'add_role',
  EDIT_ROLE: 'edit_role',
  DELETE_ROLE: 'delete_role',
  
  // Permission management
  VIEW_PERMISSIONS: 'view_permissions',
  MANAGE_PERMISSIONS: 'manage_permissions',
  
  // Reports
  VIEW_REPORTS: 'view_reports',
  EXPORT_REPORTS: 'export_reports',
  
  // Categories
  VIEW_CATEGORIES: 'view_categories',
  ADD_CATEGORY: 'add_category',
  EDIT_CATEGORY: 'edit_category',
  DELETE_CATEGORY: 'delete_category',
  
  // Profile
  VIEW_PROFILE: 'view_profile',
  EDIT_PROFILE: 'edit_profile'
};

// Role constants - define all roles in your system
export const ROLES = {
  ADMIN: 'Admin',
  EMPLOYEE: 'Employee',
  SECURITY_GUARD: 'Security Guard',
  MANAGER: 'Manager'
};

// Default role-permission mappings (fallback if backend data is not available)
export const DEFAULT_ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_GATECHECK,
    PERMISSIONS.ADD_VISITOR,
    PERMISSIONS.EDIT_VISITOR,
    PERMISSIONS.DELETE_VISITOR,
    PERMISSIONS.APPROVE_VISITOR,
    PERMISSIONS.REJECT_VISITOR,
    PERMISSIONS.VIEW_ORGANIZATION,
    PERMISSIONS.ADD_ORGANIZATION,
    PERMISSIONS.EDIT_ORGANIZATION,
    PERMISSIONS.DELETE_ORGANIZATION,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.ADD_USER,
    PERMISSIONS.EDIT_USER,
    PERMISSIONS.DELETE_USER,
    PERMISSIONS.VIEW_ROLES,
    PERMISSIONS.ADD_ROLE,
    PERMISSIONS.EDIT_ROLE,
    PERMISSIONS.DELETE_ROLE,
    PERMISSIONS.VIEW_PERMISSIONS,
    PERMISSIONS.MANAGE_PERMISSIONS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.VIEW_CATEGORIES,
    PERMISSIONS.ADD_CATEGORY,
    PERMISSIONS.EDIT_CATEGORY,
    PERMISSIONS.DELETE_CATEGORY,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.EDIT_PROFILE
  ],
  [ROLES.EMPLOYEE]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_GATECHECK,
    PERMISSIONS.ADD_VISITOR,
    PERMISSIONS.EDIT_VISITOR,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.EDIT_PROFILE
  ],
  [ROLES.SECURITY_GUARD]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_GATECHECK,
    PERMISSIONS.ADD_VISITOR,
    PERMISSIONS.APPROVE_VISITOR,
    PERMISSIONS.REJECT_VISITOR,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.EDIT_PROFILE
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_GATECHECK,
    PERMISSIONS.ADD_VISITOR,
    PERMISSIONS.EDIT_VISITOR,
    PERMISSIONS.APPROVE_VISITOR,
    PERMISSIONS.REJECT_VISITOR,
    PERMISSIONS.VIEW_ORGANIZATION,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.VIEW_CATEGORIES,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.EDIT_PROFILE
  ]
};

/**
 * Check if user has a specific permission
 * @param {Array} userPermissions - Array of user's effective permissions
 * @param {string} requiredPermission - Permission to check
 * @returns {boolean}
 */
export const hasPermission = (userPermissions, requiredPermission) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }
  
  return userPermissions.includes(requiredPermission);
};

/**
 * Check if user has any of the specified permissions
 * @param {Array} userPermissions - Array of user's effective permissions  
 * @param {Array} requiredPermissions - Array of permissions to check
 * @returns {boolean}
 */
export const hasAnyPermission = (userPermissions, requiredPermissions) => {
  if (!userPermissions || !Array.isArray(userPermissions) || !requiredPermissions || !Array.isArray(requiredPermissions)) {
    return false;
  }
  
  return requiredPermissions.some(permission => userPermissions.includes(permission));
};

/**
 * Check if user has all of the specified permissions
 * @param {Array} userPermissions - Array of user's effective permissions
 * @param {Array} requiredPermissions - Array of permissions to check
 * @returns {boolean}
 */
export const hasAllPermissions = (userPermissions, requiredPermissions) => {
  if (!userPermissions || !Array.isArray(userPermissions) || !requiredPermissions || !Array.isArray(requiredPermissions)) {
    return false;
  }
  
  return requiredPermissions.every(permission => userPermissions.includes(permission));
};

/**
 * Check if user has a specific role
 * @param {Array} userRoles - Array of user's roles
 * @param {string} requiredRole - Role to check
 * @returns {boolean}
 */
export const hasRole = (userRoles, requiredRole) => {
  if (!userRoles || !Array.isArray(userRoles)) {
    return false;
  }
  
  return userRoles.includes(requiredRole);
};

/**
 * Check if user has any of the specified roles
 * @param {Array} userRoles - Array of user's roles
 * @param {Array} requiredRoles - Array of roles to check
 * @returns {boolean}
 */
export const hasAnyRole = (userRoles, requiredRoles) => {
  if (!userRoles || !Array.isArray(userRoles) || !requiredRoles || !Array.isArray(requiredRoles)) {
    return false;
  }
  
  return requiredRoles.some(role => userRoles.includes(role));
};

/**
 * Get effective permissions for given roles (fallback function)
 * @param {Array} roles - Array of role names
 * @returns {Array} - Array of permissions
 */
export const getEffectivePermissions = (roles) => {
  if (!roles || !Array.isArray(roles)) {
    return [];
  }
  
  const permissions = new Set();
  
  roles.forEach(role => {
    const rolePermissions = DEFAULT_ROLE_PERMISSIONS[role] || [];
    rolePermissions.forEach(permission => permissions.add(permission));
  });
  
  return Array.from(permissions);
};

/**
 * Filter menu items based on user permissions
 * @param {Array} menuItems - Array of menu items with required permissions
 * @param {Array} userPermissions - User's effective permissions
 * @returns {Array} - Filtered menu items
 */
export const filterMenuItemsByPermissions = (menuItems, userPermissions) => {
  if (!menuItems || !Array.isArray(menuItems)) {
    return [];
  }
  
  return menuItems.filter(item => {
    // If no permissions required, show item
    if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
      return true;
    }
    
    // If user has any of the required permissions, show item
    return hasAnyPermission(userPermissions, item.requiredPermissions);
  });
};