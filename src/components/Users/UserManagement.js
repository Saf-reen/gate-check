import React, { useState, useEffect } from 'react';
import { FaBuilding, FaPlus, FaUsers, FaCalendar, FaEnvelope, FaUser, FaPhone, FaIdBadge, FaArrowLeft, FaEdit, FaTrash, FaTimes, FaLayerGroup, FaExclamationTriangle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';
import { api } from '../Auth/api'; // Import your API service

// Enhanced AddUserModal component with API integration
const AddUserModal = ({ onClose, onUserAdded, organizationId }) => {
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
    floor: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear general errors when any field changes
    if (errors.general) {
      setErrors(prev => ({
        ...prev,
        general: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Basic validations
    if (!formData.name.trim()) {
      newErrors.name = 'User name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Mobile number is required';
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number';
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
    } else if (formData.userId.trim().length < 3) {
      newErrors.userId = 'User ID must be at least 3 characters long';
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Prepare user data for API call
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        employeeId: formData.employeeId.trim(),
        role: formData.role,
        companyName: formData.companyName.trim(),
        userId: formData.userId.trim(),
        aliasname: formData.aliasname.trim() || null,
        blockBuilding: formData.blockBuilding.trim() || null,
        floor: formData.floor.trim() || null,
        password: formData.password,
        organizationId: organizationId
      };

      console.log('Creating user with data:', { ...userData, password: '[HIDDEN]' });

      // Make API call to create user
      const response = await api.users.create(userData);
      
      if (response.data) {
        console.log('User created successfully:', response.data);
        
        // Extract user data from response
        const newUser = {
          id: response.data.id || response.data.user?.id || Date.now(),
          name: response.data.name || response.data.user?.name,
          email: response.data.email || response.data.user?.email,
          phone: response.data.phone || response.data.user?.phone,
          employeeId: response.data.employeeId || response.data.user?.employeeId,
          role: response.data.role || response.data.user?.role,
          userId: response.data.userId || response.data.user?.userId,
          companyName: response.data.companyName || response.data.user?.companyName,
          aliasname: response.data.aliasname || response.data.user?.aliasname,
          blockBuilding: response.data.blockBuilding || response.data.user?.blockBuilding,
          floor: response.data.floor || response.data.user?.floor,
          dateAdded: response.data.createdAt || response.data.dateAdded || new Date().toISOString(),
          status: response.data.status || 'Active'
        };
        
        // Call parent callback with new user data
        onUserAdded(newUser);
        onClose();
      }
    } catch (error) {
      console.error('Error creating user:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to create user. Please try again.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle validation errors object
        const serverErrors = error.response.data.errors;
        if (typeof serverErrors === 'object') {
          // Map server errors to form fields
          const mappedErrors = {};
          Object.keys(serverErrors).forEach(field => {
            const errorValue = serverErrors[field];
            const errorText = Array.isArray(errorValue) ? errorValue[0] : errorValue;
            mappedErrors[field] = errorText;
          });
          setErrors(mappedErrors);
          return;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Handle specific error types
      if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('exist')) {
        setErrors({ email: 'Email address is already registered' });
      } else if (errorMessage.toLowerCase().includes('userid') && errorMessage.toLowerCase().includes('exist')) {
        setErrors({ userId: 'User ID is already taken' });
      } else if (errorMessage.toLowerCase().includes('employee') && errorMessage.toLowerCase().includes('exist')) {
        setErrors({ employeeId: 'Employee ID is already registered' });
      } else if (errorMessage.toLowerCase().includes('validation')) {
        setErrors({ general: 'Please check your input and try again' });
      } else if (errorMessage.toLowerCase().includes('network') || !navigator.onLine) {
        setErrors({ general: 'Network error. Please check your connection and try again.' });
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-2xl bg-white shadow-2xl rounded-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-white border border-purple-800 rounded-lg">
              <FaUser className="w-5 h-5 text-purple-800" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Add New User</h2>
              <p className="text-sm text-gray-600">Fill in the user information below</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 transition-colors rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            <FaTimes className="w-5 h-5 text-purple-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {errors.general && (
            <div className="p-4 mb-6 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg">
              {errors.general}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="flex items-center mb-2 space-x-2 text-sm font-medium text-gray-700">
                <FaBuilding className="w-4 h-4 text-purple-500" />
                <span>Company Name *</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
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
                <FaUser className="w-4 h-4 text-purple-500" />
                <span>User Name *</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
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
                <FaIdBadge className="w-4 h-4 text-purple-500" />
                <span>User ID *</span>
              </label>
              <input
                type="text"
                name="userId"
                value={formData.userId}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
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
                <FaEnvelope className="w-4 h-4 text-purple-500" />
                <span>Email ID *</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
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
                <FaPhone className="w-4 h-4 text-purple-500" />
                <span>Mobile Number *</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
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
                <FaUser className="w-4 h-4 text-purple-500" />
                <span>Alias Name (Optional)</span>
              </label>
              <input
                type="text"
                name="aliasname"
                value={formData.aliasname}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter alias name"
              />
            </div>

            <div>
              <label className="flex items-center mb-2 space-x-2 text-sm font-medium text-gray-700">
                <FaIdBadge className="w-4 h-4 text-purple-500" />
                <span>Employee ID *</span>
              </label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
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
                <FaBuilding className="w-4 h-4 text-purple-500" />
                <span>Block/Building</span>
              </label>
              <input
                type="text"
                name="blockBuilding"
                value={formData.blockBuilding}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Block A, Building 1"
              />
            </div>

            <div>
              <label className="flex items-center mb-2 space-x-2 text-sm font-medium text-gray-700">
                <FaLayerGroup className="w-4 h-4 text-purple-500" />
                <span>Floor</span>
              </label>
              <input
                type="text"
                name="floor"
                value={formData.floor}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-4 py-3 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="1st Floor, 2nd Floor"
              />
            </div>

            <div>
              <label className="flex items-center mb-2 space-x-2 text-sm font-medium text-gray-700">
                <FaUser className="w-4 h-4 text-purple-500" />
                <span>Role *</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
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

            <div>
              <label className="flex items-center mb-2 space-x-2 text-sm font-medium text-gray-700">
                <FaIdBadge className="w-4 h-4 text-purple-500" />
                <span>Password *</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors pr-12 disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute text-gray-400 transition-colors transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600 disabled:opacity-50"
                >
                  {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="flex items-center mb-2 space-x-2 text-sm font-medium text-gray-700">
                <FaIdBadge className="w-4 h-4 text-purple-500" />
                <span>Confirm Password *</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors pr-12 disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  className="absolute text-gray-400 transition-colors transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600 disabled:opacity-50"
                >
                  {showConfirmPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="flex mt-8 space-x-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center flex-1 px-6 py-3 space-x-2 text-purple-800 transition-colors bg-white border border-purple-800 rounded-lg hover:bg-purple-100 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating User...</span>
                </>
              ) : (
                <span>Add User</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserManagement = ({ organization, onBack, onUpdateOrganization }) => {
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [deleteLoading, setDeleteLoading] = useState({});
  
  // Load users when component mounts or organization changes
  useEffect(() => {
    if (organization?.id) {
      loadUsers();
    } else {
      setUsers(organization?.users || []);
    }
  }, [organization]);

  const loadUsers = async () => {
    if (!organization?.id) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      console.log('Loading users for organization:', organization.id);
      
      // Make API call to fetch users for the organization
      const response = await api.users.getByOrganization(organization.id);
      
      if (response.data) {
        const fetchedUsers = Array.isArray(response.data) ? response.data : response.data.users || [];
        console.log('Users loaded successfully:', fetchedUsers.length);
        setUsers(fetchedUsers);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      
      let errorMessage = 'Failed to load users. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setErrors({ load: errorMessage });
      
      // Fallback to organization users if API fails
      if (organization?.users) {
        setUsers(organization.users);
      }
    } finally {
      setLoading(false);
    }
  };

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
                      <p className="text-gray-600">No organization selected</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* No Organization Message */}
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
                    onClick={onBack || (() => window.history.back())}
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

  const handleAddUser = () => {
    setShowAddUserModal(true);
  };

  const handleUserAdded = (userData) => {
    console.log('User added:', userData);
    
    // Add user to local state
    const updatedUsers = [...users, userData];
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

  const handleDeleteUser = async (userId) => {
    const user = users.find(u => u.id === userId);
    const userName = user?.name || 'this user';
    
    if (!window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    setDeleteLoading(prev => ({ ...prev, [userId]: true }));
    setErrors({});

    try {
      console.log('Deleting user:', userId);
      
      // Make API call to delete user
      await api.users.delete(userId);
      
      console.log('User deleted successfully');
      
      // Remove user from local state
      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      
      // Update the organization in the parent component if callback exists
      if (onUpdateOrganization) {
        const updatedOrganization = {
          ...currentOrg,
          users: updatedUsers
        };
        onUpdateOrganization(updatedOrganization);
      }
      
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
      
      // Show error alert
      alert(`Error: ${errorMessage}`);
    } finally {
      setDeleteLoading(prev => ({ ...prev, [userId]: false }));
    }
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
      return 'N/A';
    }
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
                  onClick={onBack}
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
                    <p className="text-gray-600">{currentOrg.name}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleAddUser}
                className="flex items-center px-6 py-3 space-x-2 text-purple-800 transition-colors bg-white border border-purple-800 rounded-lg hover:bg-purple-100 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                <FaPlus className="w-4 h-4" />
                <span>Add User</span>
              </button>
            </div>

            {/* Organization Info Card */}
            <div className="p-6 bg-white shadow-sm rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
                    <FaBuilding className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">{currentOrg.name}</h2>
                    <p className="text-sm text-gray-600">
                      {currentOrg.address || 'No address provided'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold text-purple-600">{users.length}</p>
                </div>
              </div>
            </div>

            {/* Error Messages */}
            {errors.load && (
              <div className="p-4 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FaExclamationTriangle className="w-4 h-4" />
                  <span>{errors.load}</span>
                </div>
                <button
                  onClick={loadUsers}
                  className="mt-2 text-sm text-red-800 underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            )}

            {errors.delete && (
              <div className="p-4 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FaExclamationTriangle className="w-4 h-4" />
                  <span>{errors.delete}</span>
                </div>
              </div>
            )}

            {/* Users List */}
            <div className="bg-white shadow-sm rounded-xl">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Users</h3>
                <p className="text-sm text-gray-600">
                  Manage users in {currentOrg.name}
                </p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                    <span className="text-gray-600">Loading users...</span>
                  </div>
                </div>
              ) : users.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-purple-100 rounded-full">
                    <FaUsers className="w-8 h-8 text-purple-300" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-800">No Users Yet</h3>
                  <p className="max-w-md mx-auto mb-8 text-gray-600">
                    Get started by adding your first user to {currentOrg.name}. You can add employees, managers, and other team members.
                  </p>
                  <button
                    onClick={handleAddUser}
                    className="flex items-center px-6 py-3 mx-auto space-x-2 text-purple-800 transition-colors bg-white border border-purple-800 rounded-lg hover:bg-purple-100 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  >
                    <FaPlus className="w-4 h-4" />
                    <span>Add First User</span>
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          User
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Role
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Employee ID
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Location
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Date Added
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
                                <FaUser className="w-4 h-4 text-purple-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {user.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {user.userId}
                                </div>
                                {user.aliasname && (
                                  <div className="text-xs text-gray-400">
                                    Alias: {user.aliasname}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.email}</div>
                            <div className="text-sm text-gray-500">{user.phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold text-purple-800 bg-purple-100 rounded-full">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                            {user.employeeId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.blockBuilding || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.floor || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                            {formatDate(user.dateAdded)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.status === 'Active' 
                                ? 'text-green-800 bg-green-100' 
                                : 'text-red-800 bg-red-100'
                            }`}>
                              {user.status || 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={deleteLoading[user.id]}
                                className="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete user"
                              >
                                {deleteLoading[user.id] ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <FaTrash className="w-4 h-4" />
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
          onClose={() => setShowAddUserModal(false)}
          onUserAdded={handleUserAdded}
          organizationId={currentOrg.id}
        />
      )}
    </div>
  );
};

export default UserManagement;