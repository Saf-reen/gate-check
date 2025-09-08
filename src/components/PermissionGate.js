import React from 'react';
import { useSelector } from 'react-redux';
import { selectHasPermission, selectHasAllPermissions, selectHasAnyPermission, selectUserRole } from '../store/slices/permissionSlice';

const PermissionGate = ({ 
  permission, 
  permissions, 
  requireAll = true, 
  role, 
  roles, 
  fallback = null, 
  children 
}) => {
  const userRole = useSelector(selectUserRole);
  
  // Always call useSelector hooks at the top level - never conditionally
  const hasSinglePermission = useSelector(state => 
    permission ? selectHasPermission(state, permission) : true
  );
  const hasAllPermissions = useSelector(state => 
    permissions && permissions.length > 0 ? selectHasAllPermissions(state, permissions) : true
  );
  const hasAnyPermission = useSelector(state => 
    permissions && permissions.length > 0 ? selectHasAnyPermission(state, permissions) : true
  );
  
  // Role-based access check
  let hasRoleAccess = true;
  if (role && userRole !== role) {
    hasRoleAccess = false;
  }
  if (roles && !roles.includes(userRole)) {
    hasRoleAccess = false;
  }

  // Permission-based access check
  let hasPermissionAccess = true;
  if (permission) {
    hasPermissionAccess = hasSinglePermission;
  } else if (permissions && permissions.length > 0) {
    if (requireAll) {
      hasPermissionAccess = hasAllPermissions;
    } else {
      hasPermissionAccess = hasAnyPermission;
    }
  }

  // Grant access if both role and permission checks pass
  const hasAccess = hasRoleAccess && hasPermissionAccess;

  if (!hasAccess) {
    return fallback;
  }

  return <>{children}</>;
};

export default PermissionGate;