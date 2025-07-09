import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { FaBuilding, FaPlus, FaSpinner } from 'react-icons/fa';
import OrganizationList from './OrganizationList';
import OrganizationForm from './OrganizationForm';
import DeleteModal from './DeleteModal';
import SearchBar from './SearchBar';
import AuthCheck from './AuthCheck';
import AddUserModal from '../Users/AddUserModal';
import UserManagement from '../Users/UserManagement';
import { api } from '../Auth/api';

const Organization = ({ userProfile, user, onLogout }) => {
  const [organizations, setOrganizations] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [selectedOrgForUser, setSelectedOrgForUser] = useState(null);
  const [organizationToEdit, setOrganizationToEdit] = useState(null);
  const [organizationToDelete, setOrganizationToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [userDataLoading, setUserDataLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [formData, setFormData] = useState({
    company_name: '',
    address: '',
    location: '',
    pin_code: ''
  });

  const isTokenValid = (token) => {
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;

      if (payload.exp && payload.exp < currentTime) {
        console.warn('Token has expired');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  const checkAuth = useCallback(() => {
    setIsInitializing(true);
    const token = localStorage.getItem('authToken');

    if (!token || !isTokenValid(token)) {
      setIsAuthenticated(false);
      setErrors({ general: 'You are not authenticated. Please login again.' });
      setIsInitializing(false);
      return false;
    }

    setIsAuthenticated(true);
    setIsInitializing(false);
    return true;
  }, []);

  const fetchUsersForOrganization = async (organizationId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await api.user.getByOrganization(organizationId, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        const userData = response.data.users || response.data.data || response.data;
        const usersArray = Array.isArray(userData) ? userData : [];
        console.log(`Fetched ${usersArray.length} users for organization ${organizationId}:`, usersArray);
        return usersArray;
      }
      return [];
    } catch (error) {
      console.error(`Failed to fetch users for organization ${organizationId}:`, error);
      return [];
    }
  };

  const fetchOrganizations = async () => {
    setInitialLoading(true);
    setErrors({});

    try {
      const token = localStorage.getItem('authToken');
      const response = await api.organization.getAll({ headers: { Authorization: `Bearer ${token}` } });

      if (response.data) {
        const orgData = response.data.organizations || response.data.data || response.data;
        const orgsArray = Array.isArray(orgData) ? orgData : [];

        console.log('Organizations loaded:', orgsArray);

        setUserDataLoading(true);
        const orgsWithUsers = await Promise.all(
          orgsArray.map(async (org) => {
            const users = await fetchUsersForOrganization(org.id);
            return {
              ...org,
              users: users,
              userCount: users.length
            };
          })
        );

        setOrganizations(orgsWithUsers);
        console.log('Organizations with user data loaded:', orgsWithUsers);
        setUserDataLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
      let errorMessage = 'Failed to load organizations';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setErrors({ fetch: errorMessage });
      setUserDataLoading(false);
    } finally {
      setInitialLoading(false);
    }
  };

  const refreshOrganizationUsers = async (organizationId) => {
    try {
      const users = await fetchUsersForOrganization(organizationId);

      setOrganizations(prev =>
        prev.map(org =>
          org.id === organizationId
            ? { ...org, users: users, userCount: users.length }
            : org
        )
      );

      console.log(`Refreshed users for organization ${organizationId}: ${users.length} users`);
      return users;
    } catch (error) {
      console.error(`Failed to refresh users for organization ${organizationId}:`, error);
      return [];
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.company_name?.trim()) {
      newErrors.company_name = 'Organization name is required';
    }

    if (!formData.location?.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.address?.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.pin_code?.trim()) {
      newErrors.pin_code = 'PIN code is required';
    } else if (!/^\d{6}$/.test(formData.pin_code)) {
      newErrors.pin_code = 'PIN code must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      company_name: '',
      address: '',
      location: '',
      pin_code: ''
    });
    setErrors({});
  };

  const handleAddOrganization = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const token = localStorage.getItem('authToken');
      const response = await api.organization.create(formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        const newOrg = response.data.organization || response.data.data || response.data;
        const normalizedNewOrg = {
          ...newOrg,
          users: [],
          userCount: 0
        };

        setOrganizations(prev => [...prev, normalizedNewOrg]);
        refreshOrganizationUsers(newOrg.id);
        resetForm();
        setShowAddForm(false);
        console.log('Organization created successfully');
      }
    } catch (error) {
      console.error('Failed to create organization:', error);
      let errorMessage = 'Failed to create organization';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleEditOrganization = (organization) => {
    setOrganizationToEdit(organization);
    setFormData({
      company_name: organization.company_name || '',
      address: organization.address || '',
      location: organization.location || '',
      pin_code: organization.pin_code || ''
    });
    setShowEditForm(true);
  };

  const handleUpdateOrganization = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const token = localStorage.getItem('authToken');
      const response = await api.organization.update(organizationToEdit.id, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        const updatedOrg = response.data.organization || response.data.data || response.data;
        const normalizedUpdatedOrg = {
          ...updatedOrg,
          users: organizationToEdit.users || [],
          userCount: organizationToEdit.userCount || 0
        };

        setOrganizations(prev =>
          prev.map(org =>
            org.id === organizationToEdit.id ? normalizedUpdatedOrg : org
          )
        );

        resetForm();
        setShowEditForm(false);
        setOrganizationToEdit(null);
        console.log('Organization updated successfully');
      }
    } catch (error) {
      console.error('Failed to update organization:', error);
      let errorMessage = 'Failed to update organization';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrganization = (organization) => {
    setOrganizationToDelete(organization);
    setShowDeleteModal(true);
  };

  const confirmDeleteOrganization = async () => {
    if (!organizationToDelete) return;

    setDeleteLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      await api.organization.delete(organizationToDelete.id, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOrganizations(prev =>
        prev.filter(org => org.id !== organizationToDelete.id)
      );

      setShowDeleteModal(false);
      setOrganizationToDelete(null);
      console.log('Organization deleted successfully');
    } catch (error) {
      console.error('Failed to delete organization:', error);
      let errorMessage = 'Failed to delete organization';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrors({ delete: errorMessage });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAddUser = (orgId) => {
    const organization = organizations.find(org => org.id === orgId);
    console.log('Selected organization for adding user:', organization);
    setSelectedOrgId(orgId);
    setSelectedOrgForUser(organization); // Pass the entire organization object
    setShowAddUserModal(true);
  };



  const handleViewUsers = async (organization) => {
    console.log('Viewing users for organization:', organization.company_name);
    const users = await api.organization.companyId(organization.id);

    const orgWithUsers = {
      ...organization,
      users: users || []
    };

    console.log('Users list for viewing:', users);
    setSelectedOrganization(orgWithUsers);
    setShowUserManagement(true);
  };

  const handleUserAdded = async (newUser, orgId) => {
    console.log('User added callback triggered:', { newUser, orgId });
    await refreshOrganizationUsers(orgId);
    setShowAddUserModal(false);
    setSelectedOrgId(null);
    setSelectedOrgForUser(null);
    console.log('User added successfully to organization');
  };

  const handleUserUpdate = async (updatedUsers) => {
    console.log('User update received from UserManagement:', updatedUsers);

    if (selectedOrganization?.id) {
      await refreshOrganizationUsers(selectedOrganization.id);
    }

    setSelectedOrganization(prev => ({
      ...prev,
      users: updatedUsers || []
    }));

    console.log(`Organization ${selectedOrganization?.company_name} users updated to ${updatedUsers?.length || 0} users`);
  };

  const renderLoading = () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <FaSpinner className="w-12 h-12 mx-auto mb-4 text-purple-800 animate-spin" />
        <p className="text-gray-600">Loading organizations...</p>
        {userDataLoading && (
          <p className="mt-2 text-sm text-gray-500">Fetching user data...</p>
        )}
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <UserManagement
      organization={selectedOrganization}
      users={selectedOrganization.users}
      onBack={() => {
        setShowUserManagement(false);
        setSelectedOrganization(null);
      }}
      onUserUpdate={handleUserUpdate}
    />
  );

  const renderMainView = () => (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-full min-h-screen lg:ml-0">
        <main className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <FaBuilding className="w-8 h-8 text-purple-800" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Organization Management</h1>
                  <p className="text-gray-600">Manage your organizations and their members</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                disabled={loading}
                className="flex items-center px-6 py-3 space-x-2 text-purple-800 transition-colors bg-white border border-purple-800 rounded-lg hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <FaSpinner className="w-4 h-4 animate-spin" />
                ) : (
                  <FaPlus className="w-4 h-4" />
                )}
                <span>Add Organization</span>
              </button>
            </div>

            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              onClearSearch={clearSearch}
            />

            {errors.fetch && (
              <div className="p-2 rounded-lg">
                <p className="text-sm text-red-600">{errors.fetch}</p>
                <button
                  onClick={fetchOrganizations}
                  className="mt-2 text-sm text-red-800 underline hover:no-underline"
                >
                  Try Again
                </button>
              </div>
            )}

            {errors.delete && (
              <div className="p-4 border border-red-300 rounded-lg bg-red-50">
                <p className="text-sm text-red-600">{errors.delete}</p>
                <button
                  onClick={() => setErrors(prev => ({ ...prev, delete: '' }))}
                  className="mt-2 text-sm text-red-800 underline hover:no-underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {userDataLoading && (
              <div className="flex items-center justify-center p-4 bg-white rounded-lg shadow">
                <FaSpinner className="w-5 h-5 mr-2 text-purple-800 animate-spin" />
                <span className="text-sm text-gray-600">Loading user data...</span>
              </div>
            )}

            <OrganizationList
              organizations={filteredOrganizations}
              searchQuery={searchQuery}
              loading={loading}
              userDataLoading={userDataLoading}
              onEditOrganization={handleEditOrganization}
              onDeleteOrganization={handleDeleteOrganization}
              onAddUser={handleAddUser}
              onViewUsers={handleViewUsers}
            />
          </div>
        </main>
      </div>

      {showAddForm && (
        <OrganizationForm
          formData={formData}
          errors={errors}
          loading={loading}
          onInputChange={handleInputChange}
          onSubmit={handleAddOrganization}
          onCancel={() => {
            setShowAddForm(false);
            resetForm();
          }}
          title="Add New Organization"
          submitText="Add Organization"
        />
      )}

      {showEditForm && organizationToEdit && (
        <OrganizationForm
          formData={formData}
          errors={errors}
          loading={loading}
          onInputChange={handleInputChange}
          onSubmit={handleUpdateOrganization}
          onCancel={() => {
            setShowEditForm(false);
            setOrganizationToEdit(null);
            resetForm();
          }}
          title="Edit Organization"
          submitText="Update Organization"
        />
      )}

      {showDeleteModal && organizationToDelete && (
        <DeleteModal
          organizationName={organizationToDelete.company_name}
          onCancel={() => {
            setShowDeleteModal(false);
            setOrganizationToDelete(null);
          }}
          onConfirm={confirmDeleteOrganization}
          loading={deleteLoading}
        />
      )}

      {showAddUserModal && selectedOrgForUser && (
        <AddUserModal
          isOpen={showAddUserModal}
          onClose={() => {
            setShowAddUserModal(false);
            setSelectedOrgId(null);
            setSelectedOrgForUser(null);
          }}
          organization={selectedOrgForUser} // Pass the entire organization object
          onUserAdded={handleUserAdded}
        />
      )}
    </div>
  );

  const filteredOrganizations = useMemo(() => {
    if (!searchQuery.trim()) {
      return organizations;
    }
    return organizations.filter(org =>
      org.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.pin_code?.includes(searchQuery)
    );
  }, [organizations, searchQuery]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrganizations();
    }
  }, [isAuthenticated]);

  return (
    <AuthCheck
      isInitializing={isInitializing}
      isAuthenticated={isAuthenticated}
      errors={errors}
      onLogout={onLogout}
      renderLoading={renderLoading}
      renderMain={renderMainView}
      renderUserManagement={renderUserManagement}
    />
  );
};

export default Organization;
