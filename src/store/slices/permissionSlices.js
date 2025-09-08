// 1. store/slices/permissionSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  role: null,
  organization: null,
  permissions: [],
  isLoading: false,
  error: null,
  isInitialized: false
};

const permissionSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    setUserAccess: (state, action) => {
      const { role, organization, permissions } = action.payload;
      state.role = role;
      state.organization = organization;
      state.permissions = permissions || [];
      state.isLoading = false;
      state.error = null;
      state.isInitialized = true;
    },
    setPermissionsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setPermissionsError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearPermissions: (state) => {
      return initialState;
    },
    updatePermissions: (state, action) => {
      state.permissions = action.payload;
    }
  }
});

export const {
  setUserAccess,
  setPermissionsLoading,
  setPermissionsError,
  clearPermissions,
  updatePermissions
} = permissionSlice.actions;

// Selectors
export const selectPermissions = (state) => state.permissions;
export const selectUserRole = (state) => state.permissions.role;
export const selectUserOrganization = (state) => state.permissions.organization;
export const selectUserPermissions = (state) => state.permissions.permissions;
export const selectPermissionsLoading = (state) => state.permissions.isLoading;
export const selectPermissionsError = (state) => state.permissions.error;
export const selectIsPermissionsInitialized = (state) => state.permissions.isInitialized;

// Permission checker selector
export const selectHasPermission = (state, permission) => {
  const permissions = state.permissions.permissions;
  if (!permissions || !Array.isArray(permissions)) return false;
  
  // Handle both string array and object array formats
  if (typeof permissions[0] === 'string') {
    return permissions.includes(permission);
  }
  
  // Handle object format like [{ name: 'permission_name', granted: true }]
  const permissionObj = permissions.find(p => p.name === permission || p.permission === permission);
  return permissionObj ? permissionObj.granted || permissionObj.allowed : false;
};

// Multi-permission checker (user needs ALL permissions)
export const selectHasAllPermissions = (state, permissionsArray) => {
  return permissionsArray.every(permission => selectHasPermission(state, permission));
};

// Multi-permission checker (user needs ANY of the permissions)
export const selectHasAnyPermission = (state, permissionsArray) => {
  return permissionsArray.some(permission => selectHasPermission(state, permission));
};

export default permissionSlice.reducer;
