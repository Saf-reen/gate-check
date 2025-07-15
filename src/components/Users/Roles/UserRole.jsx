import React, { useState, useEffect } from "react";
import { Plus, Loader, Users, Search, RefreshCw } from "lucide-react";
import { api } from '../../Auth/api';
import UserRoleTable from './UserRoleTable';
import UserRoleModal from './UserRoleModal';
import AlertMessage from '../../RolesPermissions/Roles/AlertMessage';
import UserRoleStatsCards from './UserRoleStatsCards';

const UserRoles = ({ userProfile }) => {
  const [userRoles, setUserRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUserRole, setSelectedUserRole] = useState(null);
  const [filterRole, setFilterRole] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [newUserRole, setNewUserRole] = useState({
    user: "",
    role: ""
  });
  const [company, setCompany] = useState(null);

  useEffect(() => {
    if (userProfile && userProfile.company_id) {
      setCompany(userProfile.company_id);
    }
  }, [userProfile]);

  useEffect(() => {
    if (company) {
      fetchInitialData();
    }
  }, [company]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch roles and user roles
      const [userRolesResponse, rolesResponse] = await Promise.all([
        api.userRoles.getAll(),
        api.roles.getAll()
      ]);

      setUserRoles(userRolesResponse.data);
      setRoles(rolesResponse.data);
      console.log('Fetched user roles:', userRolesResponse.data);
      console.log('Fetched roles:', rolesResponse.data);

      // Initialize usersResponse
      let usersResponse = { data: [] };

      // Fetch users for the selected organization - Pass company ID
      if (company) {
        usersResponse = await api.user.getByOrganization(company);
        setUsers(usersResponse.data);
      }

      console.log('Fetched user roles:', userRolesResponse.data);
      console.log('Fetched users:', usersResponse.data || 'No organization selected');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRoles = async () => {
    try {
      setError(null);
      const response = await api.userRoles.getAll();
      setUserRoles(response.data);
    } catch (err) {
      console.error('Error fetching user roles:', err);
      setError('Failed to load user roles. Please try again.');
    }
  };

  const handleAddUserRole = async () => {
    if (!newUserRole.user) {
      alert('Please select a user');
      return;
    }
    if (!newUserRole.role) {
      alert('Please select a role');
      return;
    }

    console.log(newUserRole)
    try {
      setSubmitting(true);
      console.log('Creating user role:', newUserRole);
      const response = await api.userRoles.create(newUserRole);
      setUserRoles([...userRoles, response.data]);
      setNewUserRole({ user: "", role: "" });
      setShowAddModal(false);
      setError(null);
    } catch (err) {
      console.error('Error creating user role:', err);
      setError(err.response?.data?.message || 'Failed to create user role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUserRole = async () => {
    if (!selectedUserRole || !selectedUserRole.user) {
      alert('Please select a user');
      return;
    }
    if (!selectedUserRole.role) {
      alert('Please select a role');
      return;
    }
    
    try {
      setSubmitting(true);
      const response = await api.userRoles.update(selectedUserRole.user_role_id, selectedUserRole);
      setUserRoles(userRoles.map(ur =>
        ur.id === selectedUserRole.id ? response.data : ur
      ));
      setShowEditModal(false);
      setSelectedUserRole(null);
      setError(null);
    } catch (err) {
      console.error('Error updating user role:', err);
      setError(err.response?.data?.message || 'Failed to update user role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUserRole = async (userRoleId) => {
    if (!window.confirm("Are you sure you want to delete this user role assignment?")) {
      return;
    }
    try {
      await api.userRoles.delete(userRoleId);
      setUserRoles(userRoles.filter(ur => ur.id !== userRoleId));
      setError(null);
    } catch (err) {
      console.error('Error deleting user role:', err);
      setError(err.response?.data?.message || 'Failed to delete user role');
    }
  };

  const filteredUserRoles = userRoles.filter(ur => {
    const matchesSearch = ur.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ur.role?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === "all" || ur.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  const uniqueRoles = [...new Set(userRoles.map(ur => ur.role))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-gray-50">
        <div className="text-center">
          <Loader className="mx-auto mb-4 text-purple-600 animate-spin" size={48} />
          <p className="text-gray-600">Loading user roles...</p>
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
                User Roles Management
              </h1>
              <p className="mt-1 text-gray-600">Assign roles to users</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 p-2 text-purple-800 transition-colors bg-transparent border border-purple-800 rounded-lg hover:bg-purple-100"
            >
              <Plus size={20} />
              Assign Role
            </button>
          </div>
        </div>
        <AlertMessage message={error} type="error" />
        <UserRoleStatsCards
          userRoles={userRoles}
          users={users}
          roles={roles}
        />
        <div className="p-2 mb-6 bg-white border rounded-lg shadow-sm">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={15} />
                <input
                  type="text"
                  placeholder="Search users or roles..."
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
              onClick={fetchUserRoles}
              className="flex items-center px-3 py-2 text-purple-600 rounded-lg bg-purple-50 hover:bg-purple-100 disabled:opacity-50"
            >
              <RefreshCw className='w-4 h-4 mr-2' />
              Refresh
            </button>
          </div>
        </div>
        <UserRoleTable
          userRoles={filteredUserRoles}
          onEdit={setSelectedUserRole}
          onShowEditModal={setShowEditModal}
          onDelete={handleDeleteUserRole}
        />
        <UserRoleModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Assign Role to User"
          userRole={newUserRole}
          onChange={setNewUserRole}
          onSubmit={handleAddUserRole}
          submitting={submitting}
          users={users}
          roles={roles}
        />
        <UserRoleModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit User Role"
          userRole={selectedUserRole}
          onChange={setSelectedUserRole}
          onSubmit={handleEditUserRole}
          submitting={submitting}
          users={users}
          roles={roles}
          isEdit={true}
        />
      </div>
    </div>
  );
};

export default UserRoles;