
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasPermission, hasAnyPermission, hasRole, hasAnyRole } from '../components/utils/permissions';
import { AlertCircle, Lock } from 'lucide-react';

const ProtectedRoute = ({ 
  children, 
  requiredPermissions = [], 
  requiredRoles = [],
  requireAll = false, // If true, user must have ALL permissions/roles, if false, user needs ANY
  fallbackPath = '/dashboard',
  showAccessDenied = true 
}) => {
  const { isAuthenticated, effectivePermissions, userRoles, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check permissions if required
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? requiredPermissions.every(permission => hasPermission(effectivePermissions, permission))
      : hasAnyPermission(effectivePermissions, requiredPermissions);

    if (!hasRequiredPermissions) {
      if (!showAccessDenied) {
        return <Navigate to={fallbackPath} replace />;
      }

      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="max-w-md p-8 text-center bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Access Denied</h2>
            <p className="mb-4 text-gray-600">
              You don't have permission to access this page.
            </p>
            <div className="p-3 mb-4 border border-yellow-200 rounded-md bg-yellow-50">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  Required permissions: {requiredPermissions.join(', ')}
                </p>
              </div>
            </div>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  // Check roles if required
  if (requiredRoles.length > 0) {
    const hasRequiredRoles = requireAll
      ? requiredRoles.every(role => hasRole(userRoles, role))
      : hasAnyRole(userRoles, requiredRoles);

    if (!hasRequiredRoles) {
      if (!showAccessDenied) {
        return <Navigate to={fallbackPath} replace />;
      }

      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="max-w-md p-8 text-center bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Access Denied</h2>
            <p className="mb-4 text-gray-600">
              Your role doesn't have access to this page.
            </p>
            <div className="p-3 mb-4 border border-yellow-200 rounded-md bg-yellow-50">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  Required roles: {requiredRoles.join(', ')}
                </p>
              </div>
            </div>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  // If all checks pass, render the protected content
  return children;
};

// Higher-order component for protecting components
export const withPermissions = (WrappedComponent, requiredPermissions = [], requiredRoles = []) => {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute 
        requiredPermissions={requiredPermissions} 
        requiredRoles={requiredRoles}
      >
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
};

// Component for conditionally rendering content based on permissions
export const PermissionGuard = ({ 
  children, 
  requiredPermissions = [], 
  requiredRoles = [],
  requireAll = false,
  fallback = null 
}) => {
  const { effectivePermissions, userRoles } = useAuth();

  // Check permissions
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? requiredPermissions.every(permission => hasPermission(effectivePermissions, permission))
      : hasAnyPermission(effectivePermissions, requiredPermissions);

    if (!hasRequiredPermissions) {
      return fallback;
    }
  }

  // Check roles
  if (requiredRoles.length > 0) {
    const hasRequiredRoles = requireAll
      ? requiredRoles.every(role => hasRole(userRoles, role))
      : hasAnyRole(userRoles, requiredRoles);

    if (!hasRequiredRoles) {
      return fallback;
    }
  }

  return children;
};

export default ProtectedRoute;
