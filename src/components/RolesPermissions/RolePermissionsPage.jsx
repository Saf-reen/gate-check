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

    try {
      setSubmitting(true);
      const response = await api.rolePermissions.create(newRolePermission);
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
    if (!selectedRolePermission || !selectedRolePermission.role) {
      alert('Please select a role');
      return;
    }
    if (!selectedRolePermission.permission || selectedRolePermission.permission.length === 0) {
      alert('Please select at least one permission');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.rolePermissions.update(selectedRolePermission.id, selectedRolePermission);
      setRolePermissions(rolePermissions.map(rp =>
        rp.id === selectedRolePermission.id ? response.data : rp
      ));
      setShowEditModal(false);
      setSelectedRolePermission(null);
      setError(null);
    } catch (err) {
      console.error('Error updating role permission:', err);
      setError(err.response?.data?.message || 'Failed to update role permission');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRolePermission = async (rolePermissionId) => {
    // Validate the ID
    if (!rolePermissionId || rolePermissionId === undefined || rolePermissionId === null) {
      console.error("Invalid role_permission_id for delete:", rolePermissionId);
      setError("Invalid role permission ID. Unable to delete.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this role permission assignment?")) {
      return;
    }

    try {
      console.log(`Attempting to delete role permission with ID: ${rolePermissionId}`);

      // Make sure we're passing the ID correctly to the API
      await api.rolePermissions.delete(rolePermissionId);

      // Update the state to remove the deleted item
      setRolePermissions(prevRolePermissions =>
        prevRolePermissions.filter(rp => rp.id !== rolePermissionId)
      );

      setError(null);
      console.log(`Successfully deleted role permission with ID: ${rolePermissionId}`);

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
          onEdit={setSelectedRolePermission}
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
          onClose={() => setShowEditModal(false)}
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