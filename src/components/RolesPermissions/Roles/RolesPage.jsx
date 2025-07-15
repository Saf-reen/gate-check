import React, { useState, useEffect } from "react";
import { Plus, Loader, Users, Search, RefreshCw } from "lucide-react";
import { api } from '../../Auth/api';
import RoleTable from './RoleTable';
import RoleModal from './RoleModal';
import AlertMessage from './AlertMessage';
import StatsCards from './StatsCards';

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [filterActive, setFilterActive] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [newRole, setNewRole] = useState({
    name: "",
    is_active: true
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.roles.getAll();
      setRoles(response.data);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError('Failed to load roles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async () => {
    if (!newRole.name.trim()) {
      alert('Please enter a role name');
      return;
    }
    try {
      setSubmitting(true);
      const response = await api.roles.create(newRole);
      setRoles([...roles, response.data]);
      setNewRole({ name: "", is_active: true });
      setShowAddModal(false);
      setError(null);
    } catch (err) {
      console.error('Error creating role:', err);
      setError(err.response?.data?.message || 'Failed to create role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditRole = async () => {
    if (!selectedRole || !selectedRole.name.trim()) {
      alert('Please enter a role name');
      return;
    }
    try {
      setSubmitting(true);
      const response = await api.roles.update(selectedRole.role_id, selectedRole);
      setRoles(roles.map(role =>
        role.role_id === selectedRole.role_id ? response.data : role
      ));
      setShowEditModal(false);
      setSelectedRole(null);
      setError(null);
    } catch (err) {
      console.error('Error updating role:', err);
      setError(err.response?.data?.message || 'Failed to update role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm("Are you sure you want to delete this role?")) {
      return;
    }
    try {
      await api.roles.delete(roleId);
      setRoles(roles.filter(role => role.role_id !== roleId));
      setError(null);
    } catch (err) {
      console.error('Error deleting role:', err);
      setError(err.response?.data?.message || 'Failed to delete role');
    }
  };

  const toggleRoleStatus = async (roleId) => {
    const role = roles.find(r => r.role_id === roleId);
    if (!role) return;
    try {
      const updatedRole = { ...role, is_active: !role.is_active };
      const response = await api.roles.update(roleId, updatedRole);
      setRoles(roles.map(r =>
        r.role_id === roleId ? response.data : r
      ));
      setError(null);
    } catch (err) {
      console.error('Error updating role status:', err);
      setError(err.response?.data?.message || 'Failed to update role status');
    }
  };

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterActive === "all" ||
                         (filterActive === "active" && role.is_active) ||
                         (filterActive === "inactive" && !role.is_active);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-gray-50">
        <div className="text-center">
          <Loader className="mx-auto mb-4 text-purple-600 animate-spin" size={48} />
          <p className="text-gray-600">Loading roles...</p>
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
                <Users className="text-purple-600" size={32} />
                Roles Management
              </h1>
              <p className="mt-1 text-gray-600">Manage user roles and permissions</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 p-2 text-purple-800 transition-colors bg-transparent border border-purple-800 rounded-lg hover:bg-purple-100"
            >
              <Plus size={20} />
              Add Role
            </button>
          </div>
        </div>

        <AlertMessage message={error} type="error" />

        <StatsCards roles={roles} />

        <div className="p-2 mb-6 bg-white border rounded-lg shadow-sm">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={15} />
                <input
                  type="text"
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="p-2 pl-8 text-sm border border-gray-300 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
            <button
              onClick={fetchRoles}
              className="flex items-center px-3 py-2 text-purple-600 rounded-lg bg-purple-50 hover:bg-purple-100 disabled:opacity-50"
            >
              <RefreshCw className='w-4 h-4 mr-2' />
              Refresh
            </button>
          </div>
        </div>

        <RoleTable
          roles={filteredRoles}
          onEdit={setSelectedRole}
          onShowEditModal={setShowEditModal}
          onToggleStatus={toggleRoleStatus}
          onDelete={handleDeleteRole}
        />

        <RoleModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New Role"
          role={newRole}
          onChange={setNewRole}
          onSubmit={handleAddRole}
          submitting={submitting}
        />

        <RoleModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Role"
          role={selectedRole}
          onChange={setSelectedRole}
          onSubmit={handleEditRole}
          submitting={submitting}
        />
      </div>
    </div>
  );
};

export default RolesPage;
