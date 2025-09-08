import React, { useState, useEffect } from "react";
import { Plus, Loader, Shield, Search, RefreshCw, Users, Key } from "lucide-react";
import { api } from '../Auth/api';
import RolePermissionTable from './RolePermissionTable';
import RolePermissionModal from './RolePermissionModal';
import AlertMessage from '../RolesPermissions/Roles/AlertMessage';
import RolePermissionStatsCards from './RolePermissionStatsCards';

const RolePermissionsPage = () => {
  const [rolePermissions, setRolePermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRolePermission, setSelectedRolePermission] = useState(null);
  const [filterRole, setFilterRole] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [newRolePermission, setNewRolePermission] = useState({
    role: "",
    permission: []
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all data in parallel
      const [rolePermissionsResponse, rolesResponse, permissionsResponse] = await Promise.all([
        api.rolePermissions.getAll(),
        api.roles.getAll(),
        api.permissions.getAll()
      ]);
      
      setRolePermissions(rolePermissionsResponse.data);
      console.log(rolePermissionsResponse.data, "rolePermissionsResponse");
      setRoles(rolesResponse.data);
      setPermissions(permissionsResponse.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRolePermissions = async () => {
    try {
      setError(null);
      const response = await api.rolePermissions.getAll();
      setRolePermissions(response.data);
      console.log(response,"response is ");
    } catch (err) {
      console.error('Error fetching role permissions:', err);
      setError('Failed to load role permissions. Please try again.');
    }
  };

  const handleAddRolePermission = async () => {
    if (!newRolePermission.role) {
      alert('Please select a role');
      return;
    }
    if (!newRolePermission.permission || newRolePermission.permission.length === 0) {
      alert('Please select at least one permission');
      return;
    }

    // Ensure permission is an array of IDs
    const permissionIds = newRolePermission.permission.map(perm => {
      if (typeof perm === 'number') return perm;
      // If it's a string, try to find the permission object
      const found = permissions.find(p => p.name === perm || p.permission_id === perm);
      return found ? found.permission_id : perm;
    });

    const payload = {
      ...newRolePermission,
      permission: permissionIds
    };

    try {
      setSubmitting(true);
      const response = await api.rolePermissions.create(payload);
      setRolePermissions([...rolePermissions, response.data]);
      setNewRolePermission({ role: "", permission: [] });
      setShowAddModal(false);
      setError(null);
    } catch (err) {
      console.error('Error creating role permission:', err);
      setError(err.response?.data?.message || 'Failed to create role permission');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditRolePermission = async () => {
    // Debug logging to identify the issue
    console.log('Selected Role Permission for Edit:', selectedRolePermission);
    if (!selectedRolePermission) {
      setError("No role permission selected for editing.");
      return;
    }

    // Check for role_permission_id (primary identifier)
    const rolePermissionId = selectedRolePermission.role_permission_id || selectedRolePermission.id;
    if (!rolePermissionId) {
      console.error('Missing role permission ID:', selectedRolePermission);
      setError("Role permission ID is missing. Cannot update.");
      return;
    }
    if (!selectedRolePermission.role) {
      alert('Please select a role');
      return;
    }
    if (!selectedRolePermission.permission || selectedRolePermission.permission.length === 0) {
      alert('Please select at least one permission');
      return;
    }

    // Ensure permission is an array of IDs
    const permissionIds = selectedRolePermission.permission.map(perm => {
      if (typeof perm === 'number') return perm;
      // If it's a string, try to find the permission object
      const found = permissions.find(p => p.name === perm || p.permission_id === perm);
      return found ? found.permission_id : perm;
    });

    // Prepare clean payload - only send required fields
    const updatePayload = {
      role: selectedRolePermission.role,
      permission: permissionIds
    };

    try {
      setSubmitting(true);
      console.log(`Updating role permission with ID: ${rolePermissionId}`);
      console.log('Clean update payload:', updatePayload);
      console.log('API URL will be:', `/role-permissions/${rolePermissionId}`);
      const response = await api.rolePermissions.update(rolePermissionId, updatePayload);
      console.log('Update response:', response);
      setRolePermissions(rolePermissions.map(rp => {
        // Check both possible ID fields for matching
        const currentId = rp.role_permission_id || rp.id;
        return currentId === rolePermissionId ? response.data : rp;
      }));
      setShowEditModal(false);
      setSelectedRolePermission(null);
      setError(null);
    } catch (err) {
      console.error('Error updating role permission:', err);
      console.error('Error response details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        headers: err.response?.headers
      });
      console.log(err);
      // Handle specific error cases
      if (err.response?.status === 400) {
        const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Bad Request';
        setError(`Bad Request: ${errorMessage}. Please check the data format.`);
        console.error('Bad Request Details:', err.response?.data);
      } else if (err.response?.status === 404) {
        setError('Role permission not found. It may have been deleted.');
      } else if (err.response?.status === 403) {
        setError('Permission denied. You do not have permission to update role permissions.');
      } else {
        setError(err.response?.data?.message || err.response?.data?.error || 'Failed to update role permission');
      }
      // Refresh data to ensure consistency
      fetchRolePermissions();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRolePermission = async (rolePermissionId) => {
    // Validate the ID - check both possible field names
    const actualId = rolePermissionId?.role_permission_id || rolePermissionId?.id || rolePermissionId;
    
    if (!actualId || actualId === undefined || actualId === null) {
      console.error("Invalid role_permission_id for delete:", rolePermissionId);
      setError("Invalid role permission ID. Unable to delete.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this role permission assignment?")) {
      return;
    }

    try {
      console.log(`Attempting to delete role permission with ID: ${actualId}`);

      // Make sure we're passing the ID correctly to the API
      await api.rolePermissions.delete(actualId);

      // Update the state to remove the deleted item
      setRolePermissions(prevRolePermissions =>
        prevRolePermissions.filter(rp => {
          const currentId = rp.role_permission_id || rp.id;
          return currentId !== actualId;
        })
      );

      setError(null);
      console.log(`Successfully deleted role permission with ID: ${actualId}`);

    } catch (err) {
      console.error('Error deleting role permission:', err);

      // Handle specific error cases
      if (err.response?.status === 404) {
        setError('Role permission not found. It may have already been deleted.');
      } else if (err.response?.status === 403) {
        setError('Permission denied. You do not have permission to delete role permissions.');
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || 'Failed to delete role permission');
      }

      // Refresh the data to ensure consistency
      fetchRolePermissions();
    }
  };

  // Enhanced edit handler to ensure proper data flow
  const handleEditClick = (rolePermission) => {
    console.log('Edit clicked for role permission:', rolePermission);
    if (!rolePermission) {
      setError("Invalid role permission data.");
      return;
    }

    // Normalize role to always be a number
    let normalizedRoleId = rolePermission.role;
    if (typeof normalizedRoleId === 'string') {
      // Try to find the role by name
      const foundRole = roles.find(r => r.name === normalizedRoleId);
      if (foundRole) {
        normalizedRoleId = foundRole.role_id;
      } else {
        // Try to parse as number
        const parsed = Number(normalizedRoleId);
        normalizedRoleId = isNaN(parsed) ? '' : parsed;
      }
    }

    // Set the selected role permission with normalized role ID
    setSelectedRolePermission({
      ...rolePermission,
      role: normalizedRoleId,
      role_permission_id: rolePermission.role_permission_id || rolePermission.id
    });
    setShowEditModal(true);
  };

  const filteredRolePermissions = rolePermissions.filter(rp => {
    // Log the current role permission object to inspect its structure
    console.log('Role Permission Object:', rp);

    // Safely access properties with proper null/undefined checks
    const permissionId = rp.permission_id ? String(rp.permission_id) : '';
    const createdBy = rp.created_by ? String(rp.created_by).toLowerCase() : '';
    
    // Also check other potential searchable fields
    const roleName = rp.role ? String(rp.role).toLowerCase() : '';
    const permissionName = rp.permission_name ? String(rp.permission_name).toLowerCase() : '';

    const searchTermLower = searchTerm.toLowerCase();

    // Check if any searchable field includes the search term
    const matchesSearch = !searchTerm || // If no search term, show all
                        permissionId.includes(searchTermLower) ||
                        createdBy.includes(searchTermLower) ||
                        roleName.includes(searchTermLower) ||
                        permissionName.includes(searchTermLower);

    // Filter by role if a specific role is selected
    const matchesFilter = filterRole === "all" || 
                        (rp.role && String(rp.role) === filterRole);

    return matchesSearch && matchesFilter;
  });

  // Get unique roles for filter dropdown
  // Update this line to match your actual data structure
  const uniqueRoles = [...new Set(rolePermissions
  .map(rp => rp.role)
  .filter(role => role !== null && role !== undefined))];
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-gray-50">
        <div className="text-center">
          <Loader className="mx-auto mb-4 text-purple-600 animate-spin" size={48} />
          <p className="text-gray-600">Loading role permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pl-4 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        <div className="mb-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
                <Shield className="text-purple-600" size={32} />
                Role Permissions Management
              </h1>
              <p className="mt-1 text-gray-600">Assign permissions to roles</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 p-2 text-purple-800 transition-colors bg-transparent border border-purple-800 rounded-lg hover:bg-purple-100"
            >
              <Plus size={20} />
              Assign Permissions
            </button>
          </div>
        </div>

        <AlertMessage message={error} type="error" />

        <RolePermissionStatsCards 
          rolePermissions={rolePermissions} 
          roles={roles} 
          permissions={permissions} 
        />

        <div className="p-2 mb-6 bg-white border rounded-lg shadow-sm">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={15} />
                <input
                  type="text"
                  placeholder="Search roles or permissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="p-2 pl-8 text-sm border border-gray-300 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                {uniqueRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <button
              onClick={fetchRolePermissions}
              className="flex items-center px-3 py-2 text-purple-600 rounded-lg bg-purple-50 hover:bg-purple-100 disabled:opacity-50"
            >
              <RefreshCw className='w-4 h-4 mr-2' />
              Refresh
            </button>
          </div>
        </div>

        <RolePermissionTable
          rolePermissions={filteredRolePermissions}
          onEdit={handleEditClick}
          onShowEditModal={setShowEditModal}
          onDelete={handleDeleteRolePermission}
        />

        <RolePermissionModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Assign Permissions to Role"
          rolePermission={newRolePermission}
          onChange={setNewRolePermission}
          onSubmit={handleAddRolePermission}
          submitting={submitting}
          roles={roles}
          permissions={permissions}
        />

        <RolePermissionModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedRolePermission(null);
          }}
          title="Edit Role Permissions"
          rolePermission={selectedRolePermission}
          onChange={setSelectedRolePermission}
          onSubmit={handleEditRolePermission}
          submitting={submitting}
          roles={roles}
          permissions={permissions}
          isEdit={true}
        />
      </div>
    </div>
  );
};

export default RolePermissionsPage;