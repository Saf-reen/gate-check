import React, { useState } from 'react';
import { FaBuilding, FaPlus, FaUsers, FaCalendar, FaEnvelope, FaUser, FaPhone, FaIdBadge, FaArrowLeft, FaEdit, FaTrash, FaTimes, FaLayerGroup, FaExclamationTriangle } from 'react-icons/fa';

// Mock AddUserModal component since it's not provided
const AddUserModal = ({ onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    employeeId: '',
    role: '',
    companyName: '',
    userId: '',
    aliasname: '',
    blockBuilding: '',
    floor: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'User name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Mobile number is required';
    }
    
    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }
    
    if (!formData.role.trim()) {
      newErrors.role = 'Role is required';
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.userId.trim()) {
      newErrors.userId = 'User ID is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onUserAdded(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-2xl bg-white shadow-2xl rounded-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-green-600 to-green-400">
              <FaUser className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Add New User</h2>
              <p className="text-sm text-gray-600">Fill in the user information below</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 transition-colors rounded-lg hover:bg-gray-100"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="flex items-center mb-2 space-x-2 text-sm font-medium text-gray-700">
                <FaBuilding className="w-4 h-4 text-green-500" />
                <span>Company Name *</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  errors.companyName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter company name"
              />
              {errors.companyName && (
                <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
              )}
            </div>

            <div>
              <label className="flex items-center mb-2 space-x-2 text-sm font-medium text-gray-700">
                <FaUser className="w-4 h-4 text-green-500" />
                <span>User Name *</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="flex items-center mb-2 space-x-2 text-sm font-medium text-gray-700">
                <FaIdBadge className="w-4 h-4 text-green-500" />
                <span>User ID *</span>
              </label>
              <input
                type="text"
                name="userId"
                value={formData.userId}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  errors.userId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter user ID"
              />
              {errors.userId && (
                <p className="mt-1 text-sm text-red-600">{errors.userId}</p>
              )}
            </div>

            <div>
              <label className="flex items-center mb-2 space-x-2 text-sm font-medium text-gray-700">
                <FaEnvelope className="w-4 h-4 text-green-500" />
                <span>Email ID *</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="user@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="flex items-center mb-2 space-x-2 text-sm font-medium text-gray-700">
                <FaPhone className="w-4 h-4 text-green-500" />
                <span>Mobile Number *</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="flex items-center mb-2 space-x-2 text-sm font-medium text-gray-700">
                <FaUser className="w-4 h-4 text-gray-400" />
                <span>Alias Name (Optional)</span>
              </label>
              <input
                type="text"
                name="aliasname"
                value={formData.aliasname}
                onChange={handleInputChange}
                className="w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter alias name"
              />
            </div>

            <div>
              <label className="flex items-center mb-2 space-x-2 text-sm font-medium text-gray-700">
                <FaIdBadge className="w-4 h-4 text-green-500" />
                <span>Employee ID *</span>
              </label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  errors.employeeId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="EMP001"
              />
              {errors.employeeId && (
                <p className="mt-1 text-sm text-red-600">{errors.employeeId}</p>
              )}
            </div>

            <div>
              <label className="flex items-center mb-2 space-x-2 text-sm font-medium text-gray-700">
                <FaBuilding className="w-4 h-4 text-gray-400" />
                <span>Block/Building</span>
              </label>
              <input
                type="text"
                name="blockBuilding"
                value={formData.blockBuilding}
                onChange={handleInputChange}
                className="w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Block A, Building 1"
              />
            </div>

            <div>
              <label className="flex items-center mb-2 space-x-2 text-sm font-medium text-gray-700">
                <FaLayerGroup className="w-4 h-4 text-gray-400" />
                <span>Floor</span>
              </label>
              <input
                type="text"
                name="floor"
                value={formData.floor}
                onChange={handleInputChange}
                className="w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="1st Floor, 2nd Floor"
              />
            </div>

            <div>
              <label className="flex items-center mb-2 space-x-2 text-sm font-medium text-gray-700">
                <FaUser className="w-4 h-4 text-green-500" />
                <span>Role *</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  errors.role ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Select Role</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Employee">Employee</option>
                <option value="HR">HR</option>
                <option value="IT Support">IT Support</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>
          </div>

          <div className="flex mt-8 space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserManagement = ({ organization, onBack, onUpdateOrganization }) => {
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [users, setUsers] = useState(organization?.users || []);
  
  // Check if organization exists
  if (!organization) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full min-h-screen">
          <main className="p-6">
            <div className="space-y-6">
              {/* Header with Back Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={onBack || (() => window.history.back())}
                    className="flex items-center px-4 py-2 space-x-2 text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                  >
                    <FaArrowLeft className="w-4 h-4" />
                    <span>Back to Organizations</span>
                  </button>
                  <div className="w-px h-8 bg-gray-300"></div>
                  <div className="flex items-center space-x-3">
                    <FaUsers className="w-6 h-6 text-green-500" />
                    <div>
                      <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                      <p className="text-gray-600">No organization selected</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* No Organization Message */}
              <div className="py-20 text-center bg-white shadow-sm rounded-xl">
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full">
                  <FaExclamationTriangle className="w-10 h-10 text-green-300" />
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
                    onClick={onBack || (() => window.history.back())}
                    className="flex items-center px-8 py-3 space-x-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    <FaBuilding className="w-4 h-4" />
                    <span>Go to Organizations</span>
                  </button>
                  
                  {/* <div className="text-sm text-gray-500">
                    Create or select an organization to manage users
                  </div> */}
                </div>
              </div>

              {/* Help Card */}
              {/* <div className="p-6 border border-blue-200 bg-blue-50 rounded-xl">
                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                    <FaBuilding className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold text-blue-900">What are Organizations?</h3>
                    <p className="mb-3 text-sm text-blue-800">
                      Organizations are containers that help you group users, manage permissions, and organize your team structure effectively.
                    </p>
                    <div className="text-sm text-blue-700">
                      <p className="mb-1">• <strong>Group Users:</strong> Organize team members by department or project</p>
                      <p className="mb-1">• <strong>Manage Access:</strong> Control what users can see and do</p>
                      <p>• <strong>Track Activity:</strong> Monitor user engagement and activities</p>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Use provided organization
  const currentOrg = organization;

  const handleAddUser = () => {
    setShowAddUserModal(true);
  };

  const handleUserAdded = (userData) => {
    const newUser = {
      id: Date.now(),
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      employeeId: userData.employeeId,
      role: userData.role,
      userId: userData.userId,
      companyName: userData.companyName,
      aliasname: userData.aliasname,
      blockBuilding: userData.blockBuilding,
      floor: userData.floor,
      dateAdded: new Date().toISOString()
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    
    // Update the organization in the parent component if callback exists
    if (onUpdateOrganization) {
      const updatedOrganization = {
        ...currentOrg,
        users: updatedUsers
      };
      onUpdateOrganization(updatedOrganization);
    }
    
    setShowAddUserModal(false);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      
      // Update the organization in the parent component if callback exists
      if (onUpdateOrganization) {
        const updatedOrganization = {
          ...currentOrg,
          users: updatedUsers
        };
        onUpdateOrganization(updatedOrganization);
      }
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Default back behavior - you can customize this
      window.history.back();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full min-h-screen">
        <main className="p-6">
          <div className="space-y-6">
            {/* Header with Back Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBack}
                  className="flex items-center px-4 py-2 space-x-2 text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                >
                  <FaArrowLeft className="w-4 h-4" />
                  <span>Back to Organizations</span>
                </button>
                <div className="w-px h-8 bg-gray-300"></div>
                <div className="flex items-center space-x-3">
                  <FaBuilding className="w-6 h-6 text-green-600" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">{currentOrg.name}</h1>
                    <p className="text-gray-600">User Management</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleAddUser}
                className="flex items-center px-6 py-3 space-x-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
              >
                <FaPlus className="w-4 h-4" />
                <span>Add User</span>
              </button>
            </div>

            {/* Organization Info Card */}
            <div className="p-6 bg-white shadow-sm rounded-xl">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex items-center space-x-3">
                  <FaEnvelope className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-800">{currentOrg.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FaCalendar className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Established</p>
                    <p className="font-medium text-gray-800">{formatDate(currentOrg.establishedDate)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FaUsers className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Total Users</p>
                    <p className="font-medium text-gray-800">{users.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Users List */}
            {users.length === 0 ? (
              <div className="py-16 text-center bg-white shadow-sm rounded-xl">
                <FaUsers className="w-20 h-20 mx-auto mb-6 text-gray-400" />
                <h2 className="mb-4 text-xl font-semibold text-gray-800">No Users Found</h2>
                <p className="mb-8 text-gray-600">This organization doesn't have any users yet.</p>
                <button
                  onClick={handleAddUser}
                  className="px-8 py-3 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Add First User
                </button>
              </div>
            ) : (
              <div className="bg-white shadow-sm rounded-xl">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">User Directory</h2>
                  <p className="text-sm text-gray-600">Manage organization members and their access</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Employee</th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Employee ID</th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Phone</th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Role</th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Date Added</th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user, index) => (
                        <tr key={user.id} className="transition-colors hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-yellow-100">
                                <FaUser className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{user.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <FaIdBadge className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">{user.employeeId}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <FaEnvelope className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900">{user.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <FaPhone className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900">{user.phone}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold text-green-600 bg-yellow-100 rounded-full">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">
                              {user.dateAdded ? formatDateTime(user.dateAdded) : 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => console.log('Edit user:', user.id)}
                                className="p-2 text-blue-600 transition-colors rounded hover:bg-blue-50"
                                title="Edit User"
                              >
                                <FaEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-2 text-red-600 transition-colors rounded hover:bg-red-50"
                                title="Delete User"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <AddUserModal
          onClose={() => setShowAddUserModal(false)}
          onUserAdded={handleUserAdded}
        />
      )}
    </div>
  );
};

export default UserManagement;