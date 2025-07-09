import React, { useState, useEffect } from 'react';
import { FaBuilding, FaUsers, FaCalendar, FaArrowLeft, FaEdit, FaTrash, FaExclamationTriangle, FaEye, FaTimes, FaSave, FaPlus } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';
import { api } from '../Auth/api';
import { useNavigate, useLocation } from 'react-router-dom';
import AddUserModal from '../Users/AddUserModal'; // Import the AddUserModal component

const UserManagement = ({ onBack, onUpdateOrganization, onNavigateToOrganizations, onUserCountChange }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [deleteLoading, setDeleteLoading] = useState({});
  const [updateLoading, setUpdateLoading] = useState({});
  const [userDetailsLoading, setUserDetailsLoading] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false); // State for AddUserModal
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const navigate = useNavigate();
  const location = useLocation();
  const organization = location.state?.organization;

  // Load users when component mounts or organization changes
  useEffect(() => {
    if (organization?.id) {
      console.log('Organization changed, loading users for:', organization.id);
      loadUsers();
    } else {
      console.log('No organization ID, using fallback users');
      setUsers(organization?.users || []);
    }
  }, [organization?.id]);

  // Update parent component when user count changes
  useEffect(() => {
    if (onUserCountChange && typeof onUserCountChange === 'function') {
      onUserCountChange(users.length);
    }
  }, [users.length, onUserCountChange]);

  const loadUsers = async () => {
    if (!organization?.id) {
      console.log('No organization ID provided');
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      console.log('Loading users for organization:', organization.id);
      const response = await api.user.getByOrganization(organization.id);
      console.log('API Response:', response);
      if (response.data) {
        const fetchedUsers = Array.isArray(response.data) ? response.data : response.data.users || [];
        console.log('Users loaded successfully:', fetchedUsers.length);
        setUsers(fetchedUsers);
        if (onUserCountChange) {
          onUserCountChange(fetchedUsers.length);
        }
      } else {
        console.log('No data in response, setting empty users array');
        setUsers([]);
        if (onUserCountChange) {
          onUserCountChange(0);
        }
      }
    } catch (error) {
      console.error('Error loading users:', error);
      let errorMessage = 'Failed to load users. Please try again.';
      if (error.response?.status === 404) {
        errorMessage = 'No users found for this organization.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to view users for this organization.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      setErrors({ load: errorMessage });
      if (organization?.users) {
        console.log('Using fallback users from organization object');
        setUsers(organization.users);
        if (onUserCountChange) {
          onUserCountChange(organization.users.length);
        }
      } else {
        setUsers([]);
        if (onUserCountChange) {
          onUserCountChange(0);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewUserDetails = async (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
    try {
      const userDetails = await api.organization.getUsers(user.id);
      if (userDetails) {
        setSelectedUser(userDetails);
      }
    } catch (error) {
      console.log('Failed to load detailed user information');
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditFormData({
      username: user.username || user.name || '',
      email: user.email || '',
      blockBuilding: user.blockBuilding || user.block || '',
      floor: user.floor || '',
      status: user.status || 'active'
    });
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    setUpdateLoading(prev => ({ ...prev, [selectedUser.id]: true }));
    setErrors({});
    try {
      console.log('Updating user:', selectedUser.id, editFormData);
      const response = await api.organization.updateUser(selectedUser.id, editFormData);
      const updatedUser = response.data;
      console.log('User updated successfully:', updatedUser);
      const updatedUsers = users.map(user =>
        user.id === selectedUser.id ? { ...user, ...updatedUser, ...editFormData } : user
      );
      setUsers(updatedUsers);
      if (onUpdateOrganization) {
        const updatedOrganization = {
          ...organization,
          users: updatedUsers
        };
        onUpdateOrganization(updatedOrganization);
      }
      setShowEditModal(false);
      setSelectedUser(null);
      setEditFormData({});
      console.log('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      let errorMessage = 'Failed to update user. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      setErrors({ update: errorMessage });
    } finally {
      setUpdateLoading(prev => ({ ...prev, [selectedUser.id]: false }));
    }
  };

  const handleDeleteUserConfirm = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setDeleteLoading(prev => ({ ...prev, [selectedUser.id]: true }));
    setErrors({});
    try {
      console.log('Deleting user:', selectedUser.id);
      await api.organization.deleteUser(selectedUser.id);
      const updatedUsers = users.filter(user => user.id !== selectedUser.id);
      setUsers(updatedUsers);
      if (onUserCountChange) {
        onUserCountChange(updatedUsers.length);
      }
      if (onUpdateOrganization) {
        const updatedOrganization = {
          ...organization,
          users: updatedUsers
        };
        onUpdateOrganization(updatedOrganization);
      }
      setShowDeleteModal(false);
      setSelectedUser(null);
      console.log('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      let errorMessage = 'Failed to delete user. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      setErrors({ delete: errorMessage });
    } finally {
      setDeleteLoading(prev => ({ ...prev, [selectedUser.id]: false }));
    }
  };

  const handleNavigateToOrganizations = () => {
    if (onNavigateToOrganizations) {
      onNavigateToOrganizations();
    } else if (onBack) {
      onBack();
    } else {
      navigate('/organization');
    }
  };

  const closeModals = () => {
    setShowEditModal(false);
    setShowViewModal(false);
    setShowDeleteModal(false);
    setShowAddUserModal(false);
    setSelectedUser(null);
    setEditFormData({});
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getUserStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserCountSummary = () => {
    const activeUsers = users.filter(user => user.status?.toLowerCase() === 'active').length;
    const inactiveUsers = users.filter(user => user.status?.toLowerCase() === 'inactive').length;
    const pendingUsers = users.filter(user => user.status?.toLowerCase() === 'pending').length;
    return {
      total: users.length,
      active: activeUsers,
      inactive: inactiveUsers,
      pending: pendingUsers
    };
  };

  const userCountSummary = getUserCountSummary();

  if (!organization) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full min-h-screen">
          <main className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleNavigateToOrganizations}
                    className="flex items-center px-4 py-2 space-x-2 text-purple-800 transition-colors rounded-lg hover:bg-gray-100"
                  >
                    <FaArrowLeft className="w-4 h-4" />
                    <span>Go to Organizations</span>
                  </button>
                  <div className="w-px h-8 bg-gray-300"></div>
                  <div className="flex items-center space-x-3">
                    <FaUsers className="w-6 h-6 text-purple-800" />
                    <div>
                      <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                      <p className="text-gray-600">No organization selected</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="py-20 text-center bg-white shadow-sm rounded-xl">
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-purple-100 rounded-full">
                  <FaExclamationTriangle className="w-10 h-10 text-purple-300" />
                </div>
                <h2 className="mb-4 text-2xl font-bold text-gray-800">No Organization Found</h2>
                <p className="max-w-md mx-auto mb-2 text-gray-600">
                  You need to add or select an organization before you can manage users.
                </p>
                <p className="max-w-md mx-auto mb-8 text-sm text-gray-500">
                  Organizations help you group and manage users effectively. Please create an organization first to get started.
                </p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <button
                    onClick={handleNavigateToOrganizations}
                    className="flex items-center px-8 py-3 space-x-2 text-purple-800 transition-colors bg-white border border-purple-800 rounded-lg hover:bg-purple-100 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  >
                    <FaBuilding className="w-4 h-4" />
                    <span>Go to Organizations</span>
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const currentOrg = organization;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full min-h-screen">
        <main className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleNavigateToOrganizations}
                  className="flex items-center px-4 py-2 space-x-2 text-purple-800 transition-colors rounded-lg hover:bg-gray-100"
                >
                  <FaArrowLeft className="w-4 h-4" />
                  <span>Back to Organizations</span>
                </button>
                <div className="w-px h-8 bg-gray-300"></div>
                <div className="flex items-center space-x-3">
                  <FaUsers className="w-6 h-6 text-purple-500" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                    <p className="text-gray-600">
                      {currentOrg.company_name || currentOrg.name} - {users.length} user{users.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center px-4 py-2 space-x-2 text-purple-800 transition-colors bg-white border border-purple-800 rounded-lg hover:bg-purple-100"
              >
                <FaPlus className="w-4 h-4" />
                <span>Add User</span>
              </button>
            </div>

            {errors.load && (
              <div className="text-sm text-red-700 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FaExclamationTriangle className="w-4 h-4" />
                  <span>{errors.load}</span>
                </div>
                <button
                  onClick={loadUsers}
                  className="mt-2 text-sm text-red-600 underline hover:text-red-800"
                >
                  Try again
                </button>
              </div>
            )}

            {errors.delete && (
              <div className="text-sm text-red-700 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FaExclamationTriangle className="w-4 h-4" />
                  <span>{errors.delete}</span>
                </div>
              </div>
            )}

            {errors.update && (
              <div className="text-sm text-red-700 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FaExclamationTriangle className="w-4 h-4" />
                  <span>{errors.update}</span>
                </div>
              </div>
            )}

            {Object.keys(errors).filter(key => key.startsWith('user_')).map(errorKey => (
              <div key={errorKey} className="text-sm text-red-700 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FaExclamationTriangle className="w-4 h-4" />
                  <span>{errors[errorKey]}</span>
                </div>
              </div>
            ))}

            <div className="bg-white shadow-sm rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
                    <FaBuilding className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{currentOrg.company_name || currentOrg.name}</h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">{userCountSummary.total}</div>
                  <div className="text-sm text-gray-500">Total Users</div>
                  <div className="mt-2 text-xs text-gray-400">
                    {userCountSummary.active} Active | {userCountSummary.inactive} Inactive | {userCountSummary.pending} Pending
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden bg-white shadow-sm rounded-xl">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Users</h3>
                    <p className="text-sm text-gray-600">
                      Manage and view all users in this organization ({userCountSummary.total} total)
                    </p>
                  </div>
                  {loading && (
                    <div className="flex items-center space-x-2 text-purple-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Loading users...</span>
                    </div>
                  )}
                </div>
              </div>
              {loading && users.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full">
                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-800">Loading Users</h3>
                  <p className="text-gray-600">Please wait while we fetch the user data...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full">
                    <FaUsers className="w-8 h-8 text-purple-300" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-800">No Users Yet</h3>
                  <p className="mb-6 text-gray-600">
                    Users will appear here once they are added to this organization.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          User Name
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Location
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Date Added
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.username || user.name || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.email || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              Block: {user.blockBuilding || user.block || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              Floor: {user.floor || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUserStatusColor(user.status)}`}>
                              {user.status || 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                            {formatDate(user.dateAdded || user.created_at)}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleViewUserDetails(user)}
                                disabled={userDetailsLoading[user.id]}
                                className="flex items-center p-1 text-blue-600 transition-colors rounded-md hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="View User Details"
                              >
                                {userDetailsLoading[user.id] ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <FaEye className="w-3 h-3" />
                                )}
                              </button>
                              <button
                                onClick={() => handleEditUser(user)}
                                disabled={updateLoading[user.id]}
                                className="flex items-center p-1 text-gray-500 transition-colors rounded-md hover:bg-gray-100 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Edit User"
                              >
                                {updateLoading[user.id] ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <FaEdit className="w-3 h-3" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteUserConfirm(user)}
                                disabled={deleteLoading[user.id]}
                                className="flex items-center p-1 text-red-500 transition-colors rounded-md hover:bg-red-100 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete User"
                              >
                                {deleteLoading[user.id] ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <FaTrash className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <AddUserModal
          isOpen={showAddUserModal}
          onClose={closeModals}
          organization={organization}
          onUserAdded={(newUser) => {
            setUsers(prevUsers => [...prevUsers, newUser]);
            if (onUserCountChange) {
              onUserCountChange(users.length + 1);
            }
          }}
        />
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">User Details</h3>
              <button
                onClick={closeModals}
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Name</label>
                <p className="text-sm text-gray-900">{selectedUser.username || selectedUser.name || 'N/A'}</p>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900">{selectedUser.email || 'N/A'}</p>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Block/Building</label>
                <p className="text-sm text-gray-900">{selectedUser.blockBuilding || selectedUser.block || 'N/A'}</p>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Floor</label>
                <p className="text-sm text-gray-900">{selectedUser.floor || 'N/A'}</p>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUserStatusColor(selectedUser.status)}`}>
                  {selectedUser.status || 'Active'}
                </span>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Date Added</label>
                <p className="text-sm text-gray-900">{formatDate(selectedUser.dateAdded || selectedUser.created_at)}</p>
              </div>
            </div>
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={closeModals}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Edit User</h3>
              <button
                onClick={closeModals}
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="username"
                  value={editFormData.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Block/Building</label>
                <input
                  type="text"
                  name="blockBuilding"
                  value={editFormData.blockBuilding}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Floor</label>
                <input
                  type="text"
                  name="floor"
                  value={editFormData.floor}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  value={editFormData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end p-6 space-x-3 border-t border-gray-200">
              <button
                onClick={closeModals}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                disabled={updateLoading[selectedUser.id]}
                className="flex items-center px-4 py-2 text-sm font-medium text-purple-800 bg-white border border-purple-800 rounded-md hover:bg-purple-100 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateLoading[selectedUser.id] ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md mx-4 bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Confirm Delete</h3>
              <button
                onClick={closeModals}
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
                  <FaExclamationTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">Delete User</h4>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              <p className="mb-4 text-sm text-gray-700">
                Are you sure you want to delete <strong>{selectedUser.username || selectedUser.name || 'this user'}</strong>?
                This will permanently remove the user from the organization and cannot be undone.
              </p>
              <div className="p-3 border border-red-200 rounded-md bg-red-50">
                <div className="flex">
                  <FaExclamationTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Warning</h3>
                    <div className="mt-1 text-sm text-red-700">
                      <p>This action will:</p>
                      <ul className="mt-1 list-disc list-inside">
                        <li>Remove the user from this organization</li>
                        <li>Delete all associated user data</li>
                        <li>Cannot be reversed</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end p-6 space-x-3 border-t border-gray-200">
              <button
                onClick={closeModals}
                disabled={deleteLoading[selectedUser.id]}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deleteLoading[selectedUser.id]}
                className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-600 rounded-md hover:bg-red-100 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading[selectedUser.id] ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash className="w-4 h-4 mr-2" />
                    Delete User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
