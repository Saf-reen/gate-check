import React, { useState, useMemo, useEffect } from 'react';
import { FaBuilding, FaPlus, FaTimes, FaUsers, FaCalendar, FaEnvelope, FaEye, FaSearch, FaSpinner } from 'react-icons/fa';
import AddUserModal from '../Users/AddUserModal';
import UserManagement from '../Users/UserManagement';
import { api } from '../Auth/api'; // Import your API service

const Organization = ({ userProfile, user, onLogout }) => {
  const [organizations, setOrganizations] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    establishedDate: ''
  });

  // Filter organizations based on search query
  const filteredOrganizations = useMemo(() => {
    if (!searchQuery.trim()) {
      return organizations;
    }

    const query = searchQuery.toLowerCase().trim();
    return organizations.filter(org => 
      org.name.toLowerCase().includes(query) ||
      org.email.toLowerCase().includes(query)
    );
  }, [organizations, searchQuery]);

  // Load organizations on component mount
  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Fetch organizations from API
  const fetchOrganizations = async () => {
    setInitialLoading(true);
    setErrors({});

    try {
      const response = await api.organization.getAll();
      
      if (response.data) {
        // Handle different response structures
        const orgData = response.data.organizations || response.data.data || response.data;
        setOrganizations(Array.isArray(orgData) ? orgData : []);
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
    } finally {
      setInitialLoading(false);
    }
  };

  // Validate organization form data
  const validateOrganizationForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Organization name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Organization name must be at least 3 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Organization name must be less than 100 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Official email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Date validation
    if (!formData.establishedDate) {
      newErrors.establishedDate = 'Established date is required';
    } else {
      const selectedDate = new Date(formData.establishedDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      
      if (selectedDate > today) {
        newErrors.establishedDate = 'Established date cannot be in the future';
      }
      
      // Check if date is too far in the past (e.g., before 1800)
      const minDate = new Date('1800-01-01');
      if (selectedDate < minDate) {
        newErrors.establishedDate = 'Please enter a valid established date';
      }
    }

    return newErrors;
  };

  // Check if organization name or email already exists
  const checkOrganizationExists = async (name, email, excludeId = null) => {
    try {
      const checkData = {
        name: name.trim(),
        email: email.trim(),
        ...(excludeId && { excludeId })
      };

      const response = await api.organization.checkExists(checkData);
      return response.data;
    } catch (error) {
      console.error('Error checking organization existence:', error);
      // If check fails, allow the main API call to handle the error
      return { exists: false };
    }
  };

  // Handle input changes
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
  };

  // Handle search changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Handle add organization
  const handleAddOrganization = async () => {
    // Validate form data
    const formErrors = validateOrganizationForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Check if organization already exists
      const existsResponse = await checkOrganizationExists(formData.name, formData.email);
      
      if (existsResponse.exists) {
        const duplicateErrors = {};
        if (existsResponse.duplicateFields?.includes('name')) {
          duplicateErrors.name = 'An organization with this name already exists';
        }
        if (existsResponse.duplicateFields?.includes('email')) {
          duplicateErrors.email = 'An organization with this email already exists';
        }
        setErrors(duplicateErrors);
        return;
      }

      // Prepare organization data for API
      const organizationData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        establishedDate: formData.establishedDate,
        createdBy: user?.id || userProfile?.id,
        status: 'active'
      };

      // Create organization via API
      const response = await api.organization.create(organizationData);
      
      if (response.data) {
        // Handle different response structures
        const newOrg = response.data.organization || response.data.data || response.data;
        
        // Ensure the organization has required fields
        const organizationWithDefaults = {
          id: newOrg.id,
          name: newOrg.name,
          email: newOrg.email,
          establishedDate: newOrg.establishedDate,
          users: newOrg.users || [],
          status: newOrg.status || 'active',
          createdAt: newOrg.createdAt || new Date().toISOString(),
          ...newOrg
        };

        // Add to local state
        setOrganizations(prev => [...prev, organizationWithDefaults]);
        
        // Reset form and close modal
        setFormData({ name: '', email: '', establishedDate: '' });
        setShowAddForm(false);
        
        // Show success message (you can implement a toast notification here)
        console.log('Organization created successfully:', organizationWithDefaults);
      }
    } catch (error) {
      console.error('Failed to create organization:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to create organization. Please try again.';
      
      if (error.response?.data?.errors) {
        // Handle validation errors from backend
        const backendErrors = error.response.data.errors;
        const formattedErrors = {};
        
        Object.keys(backendErrors).forEach(field => {
          const fieldErrors = backendErrors[field];
          formattedErrors[field] = Array.isArray(fieldErrors) ? fieldErrors[0] : fieldErrors;
        });
        
        setErrors(formattedErrors);
        return;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Handle specific error cases
      if (errorMessage.toLowerCase().includes('duplicate') || 
          errorMessage.toLowerCase().includes('already exists')) {
        if (errorMessage.toLowerCase().includes('name')) {
          setErrors({ name: 'An organization with this name already exists' });
        } else if (errorMessage.toLowerCase().includes('email')) {
          setErrors({ email: 'An organization with this email already exists' });
        } else {
          setErrors({ general: errorMessage });
        }
      } else if (errorMessage.toLowerCase().includes('validation')) {
        setErrors({ general: 'Please check your input and try again' });
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle add user to organization
  const handleAddUser = (orgId) => {
    setSelectedOrgId(orgId);
    setShowAddUserModal(true);
  };

  // Handle view users for organization
  const handleViewUsers = async (org) => {
    setLoading(true);
    
    try {
      // Fetch latest organization data with users
      const response = await api.organization.getById(org.id);
      
      if (response.data) {
        const updatedOrg = response.data.organization || response.data.data || response.data;
        setSelectedOrganization(updatedOrg);
        setShowUserManagement(true);
      }
    } catch (error) {
      console.error('Failed to fetch organization details:', error);
      // Fallback to existing organization data
      setSelectedOrganization(org);
      setShowUserManagement(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle user added to organization
  const handleUserAdded = async (userData) => {
    if (!selectedOrgId) return;

    setLoading(true);
    
    try {
      // Prepare user data for API
      const userPayload = {
        organizationId: selectedOrgId,
        name: userData.name.trim(),
        email: userData.email.trim().toLowerCase(),
        phone: userData.phone?.trim(),
        employeeId: userData.employeeId?.trim(),
        role: userData.role,
        status: 'active'
      };

      // Add user via API
      const response = await api.organization.addUser(userPayload);
      
      if (response.data) {
        const newUser = response.data.user || response.data.data || response.data;
        
        // Update local organizations state
        setOrganizations(prev => prev.map(org => 
          org.id === selectedOrgId 
            ? { 
                ...org, 
                users: [...(org.users || []), {
                  id: newUser.id,
                  name: newUser.name,
                  email: newUser.email,
                  phone: newUser.phone,
                  employeeId: newUser.employeeId,
                  role: newUser.role,
                  dateAdded: newUser.createdAt || new Date().toISOString(),
                  status: newUser.status || 'active',
                  ...newUser
                }]
              }
            : org
        ));
        
        console.log('User added successfully:', newUser);
      }
    } catch (error) {
      console.error('Failed to add user:', error);
      
      // Handle API errors - you might want to show a toast notification
      let errorMessage = 'Failed to add user. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      // You can implement a toast notification here
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
    
    setShowAddUserModal(false);
    setSelectedOrgId(null);
  };

  // Handle organization update
  const handleUpdateOrganization = async (updatedOrganization) => {
    try {
      // Update organization via API
      const response = await api.organization.update(updatedOrganization.id, updatedOrganization);
      
      if (response.data) {
        const updated = response.data.organization || response.data.data || response.data;
        
        // Update local state
        setOrganizations(prev => prev.map(org => 
          org.id === updated.id ? updated : org
        ));
        
        setSelectedOrganization(updated);
        console.log('Organization updated successfully:', updated);
      }
    } catch (error) {
      console.error('Failed to update organization:', error);
      
      // Handle error - you might want to show a toast notification
      let errorMessage = 'Failed to update organization. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      alert(errorMessage);
    }
  };

  // Handle back to organizations list
  const handleBackToOrganizations = () => {
    setShowUserManagement(false);
    setSelectedOrganization(null);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // If user management is shown, render the UserManagement component
  if (showUserManagement && selectedOrganization) {
    return (
      <UserManagement
        organization={selectedOrganization}
        onBack={handleBackToOrganizations}
        onUpdateOrganization={handleUpdateOrganization}
      />
    );
  }

  // Show loading state during initial load
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <FaSpinner className="w-8 h-8 mx-auto mb-4 text-purple-800 animate-spin" />
          <p className="text-gray-600">Loading organizations...</p>
        </div>
      </div>
    );
  }

  // Show error state if initial fetch failed
  if (errors.fetch) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 text-center bg-white rounded-lg shadow-lg">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
            <FaTimes className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-800">Failed to Load Organizations</h2>
          <p className="mb-4 text-gray-600">{errors.fetch}</p>
          <button
            onClick={fetchOrganizations}
            className="px-6 py-2 text-purple-800 transition-colors bg-white border border-purple-800 rounded-lg hover:bg-purple-100"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main Organizations View
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-full min-h-screen lg:ml-0">
        <main className="p-0">
          <div className="space-y-6">
            {/* Header */}
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

            {/* Search Bar */}
            <div className="relative max-w-md">
              <div className="relative">
                <FaSearch className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search Organizations..."
                  className="h-10 p-2 pl-8 text-sm bg-white border border-gray-300 rounded-lg shadow-sm w-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute p-1 transition-colors transform -translate-y-1/2 rounded-full right-3 top-1/2 hover:bg-gray-100"
                  >
                    <FaTimes className="w-3 h-3 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Search Results Info */}
            {searchQuery && (
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  {filteredOrganizations.length === 0 
                    ? 'No organizations found' 
                    : `${filteredOrganizations.length} organization${filteredOrganizations.length !== 1 ? 's' : ''} found`
                  } for "{searchQuery}"
                </span>
                {filteredOrganizations.length > 0 && (
                  <button
                    onClick={clearSearch}
                    className="font-medium text-purple-800 hover:text-purple-600"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}

            {/* Organizations List or Empty State */}
            {filteredOrganizations.length === 0 ? (
              <div className="py-16 text-center bg-white shadow-lg rounded-xl">
                {searchQuery ? (
                  <>
                    <FaSearch className="w-24 h-24 mx-auto mb-6 text-gray-400" />
                    <h2 className="mb-4 text-2xl font-bold text-gray-800">No Organizations Found</h2>
                    <p className="mb-8 text-gray-600">
                      No organizations match your search for "{searchQuery}"
                    </p>
                    <button
                      onClick={clearSearch}
                      className="px-8 py-3 mr-4 text-purple-800 transition-colors rounded-lg bg-purple-50 hover:bg-purple-100"
                    >
                      Clear Search
                    </button>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="px-8 py-3 text-purple-800 transition-colors bg-white border border-purple-800 rounded-lg hover:bg-purple-100"
                    >
                      Add New Organization
                    </button>
                  </>
                ) : (
                  <>
                    <FaBuilding className="w-24 h-24 mx-auto mb-6 text-purple-800" />
                    <h2 className="mb-4 text-2xl font-bold text-gray-800">No Organizations Registered</h2>
                    <p className="mb-8 text-gray-600">Get started by adding your first organization</p>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="px-8 py-3 text-purple-800 transition-colors bg-white border border-purple-800 rounded-lg hover:bg-purple-100"
                    >
                      Add Your First Organization
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredOrganizations.map((org) => (
                  <div key={org.id} className="p-6 transition-shadow bg-white shadow-lg rounded-xl hover:shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-12 h-12 bg-white border border-purple-800 rounded-lg">
                          <FaBuilding className="w-6 h-6 text-purple-800" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{org.name}</h3>
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <FaUsers className="w-3 h-3 mr-1" />
                            <span>{(org.users || []).length} members</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6 space-y-3">
                      <div className="flex items-center text-gray-600">
                        <FaEnvelope className="w-4 h-4 mr-3 text-purple-500" />
                        <span className="text-sm">{org.email}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaCalendar className="w-4 h-4 mr-3 text-purple-500" />
                        <span className="text-sm">Est. {formatDate(org.establishedDate)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleAddUser(org.id)}
                        disabled={loading}
                        className="flex items-center justify-center px-4 py-2 space-x-2 text-purple-800 transition-colors rounded-lg bg-purple-50 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaPlus className="w-4 h-4" />
                        <span>Add User</span>
                      </button>
                      
                      <button
                        onClick={() => handleViewUsers(org)}
                        disabled={loading}
                        className="flex items-center justify-center px-4 py-2 space-x-2 text-purple-800 transition-colors rounded-lg bg-purple-50 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaEye className="w-4 h-4" />
                        <span>View Users</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Organization Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white shadow-2xl rounded-xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Add New Organization</h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ name: '', email: '', establishedDate: '' });
                  setErrors({});
                }}
                className="p-2 transition-colors rounded-lg hover:bg-gray-100"
              >
                <FaTimes className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter organization name"
                    disabled={loading}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="org@example.com"
                    disabled={loading}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Established Date *
                  </label>
                  <input
                    type="date"
                    name="establishedDate"
                    value={formData.establishedDate}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.establishedDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  />
                  {errors.establishedDate && (
                    <p className="mt-1 text-sm text-red-500">{errors.establishedDate}</p>
                  )}
                </div>

                {errors.general && (
                  <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg">
                    {errors.general}
                  </div>
                )}
              </div>

              <div className="flex mt-6 space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ name: '', email: '', establishedDate: '' });
                    setErrors({});
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddOrganization}
                  disabled={loading}
                  className="flex items-center justify-center flex-1 px-4 py-2 space-x-2 text-white transition-colors bg-purple-800 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <FaSpinner className="w-4 h-4 animate-spin" />
                  ) : (
                    <FaPlus className="w-4 h-4" />
                  )}
                  <span>Add Organization</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default Organization;