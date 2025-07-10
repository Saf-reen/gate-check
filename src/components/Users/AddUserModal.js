import React, { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaIdBadge, FaBuilding, FaLayerGroup, FaCheckCircle } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';
import { api } from '../Auth/api'; // Assuming same API service structure

const AddUserModal = ({ onClose, onUserAdded, organization }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    companyId: organization?.id || '', // Initialize with passed organization.id
    companyName: organization?.companyName || organization?.company_name || '',
    aliasname: '',
    blockBuilding: '',
    floor: ''
  });
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Enhanced token validation
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

  // Get token from localStorage
  const getAuthToken = () => {
    try {
      const token = localStorage.getItem('authToken');
      return token;
    } catch (error) {
      console.error('Error getting token from localStorage:', error);
      return null;
    }
  };

  // Create authorization headers for API calls
  const getAuthHeaders = () => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Fetch company details
  const fetchCompanyDetails = useCallback(async () => {
    const token = getAuthToken();
    if (!token || !isTokenValid(token)) {
      setLoadingCompany(false);
      return;
    }

    try {
      let companyIdToUse = organization?.id;

      // If no organization.id passed as prop, get from token
      if (!companyIdToUse) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        companyIdToUse = payload?.company_id;
      }

      if (companyIdToUse) {
        console.log('Fetching company details for ID:', companyIdToUse);

        const response = await api.organization.companyId(companyIdToUse);
        console.log('Company API response:', response);

        const companyName = response?.data?.company_name || response?.data?.username || '';

        if (companyName) {
          setFormData(prev => ({
            ...prev,
            companyId: companyIdToUse,
            companyName: companyName
          }));
          console.log('Company name set to:', companyName);
        } else {
          console.warn('No company name found in response:', response?.data);
        }
      } else {
        console.warn('No company ID available');
      }
    } catch (error) {
      console.error('Failed to fetch company details:', error);
      setErrors(prev => ({
        ...prev,
        companyName: 'Failed to load company details'
      }));
    } finally {
      setLoadingCompany(false);
    }
  }, [organization?.id]);

  const checkAuth = useCallback(() => {
    setIsInitializing(true);
    const token = getAuthToken();

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

  // Initialize component
  useEffect(() => {
    const initializeModal = async () => {
      const isAuth = checkAuth();
      if (isAuth) {
        await fetchCompanyDetails();
      }
    };

    initializeModal();
  }, [checkAuth, fetchCompanyDetails]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Enhanced validation with backend-like patterns
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.username.trim()) {
      newErrors.username = 'User name is required';
    } else if (formData.username.trim().length < 2) {
      newErrors.username = 'Name must be at least 2 characters long';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.username.trim())) {
      newErrors.username = 'Name can only contain letters and spaces';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Mobile number is required';
    } else {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      const cleanPhone = formData.phone.replace(/[\s\-\(\)]/g, '');
      if (!phoneRegex.test(cleanPhone) || cleanPhone.length < 10) {
        newErrors.phone = 'Please enter a valid mobile number (min 10 digits)';
      }
    }

    // Company validation
    if (!formData.companyId) {
      newErrors.companyName = 'Company information is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check authentication before proceeding
    if (!checkAuth()) {
      return;
    }

    // First validate form locally
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({}); // Clear all previous errors
    setShowSuccess(false); // Clear any previous success message

    try {
      const token = getAuthToken();
      if (!token || !isTokenValid(token)) {
        setErrors({ general: 'Authentication token is invalid or expired. Please login again.' });
        setIsAuthenticated(false);
        setIsSubmitting(false);
        return;
      }

      // Prepare user data for API call
      const userData = {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile_number: formData.phone.trim(),
        company: formData.companyId,
        alias_name: formData.aliasname.trim() || null,
        block: formData.blockBuilding.trim() || null,
        floor: formData.floor.trim() || null,
      };

      console.log('Submitting user data:', userData);

      // Make API call to create user with authentication headers
      const response = await api.organization.addUser(userData, {
        headers: getAuthHeaders()
      });

      if (response.data) {
        // Handle successful user creation
        const createdUser = response.data.user || response.data;

        console.log('User created successfully:', createdUser);

        // Show success message
        setSuccessMessage(`User "${formData.username}" added successfully!`);
        setShowSuccess(true);

        // Call parent callback with created user data
        if (onUserAdded) {
          await onUserAdded(createdUser, formData.companyId);
        }

        // Close modal after a delay to show success message
        setTimeout(() => {
          onClose();
        }, 2000);
      }

    } catch (error) {
      console.error('User creation error:', error);
      console.error('Error response data:', error.response);

      // Handle authentication errors first
      if (error.response?.status === 401 || error.response?.status === 403) {
        setErrors({ general: 'Authentication failed. Please login again.' });
        setIsAuthenticated(false);
        return;
      }

      // Handle different types of errors
      const errorData = error.response?.data || {};

      // Handle validation errors from backend
      if (errorData?.errors && typeof errorData.errors === 'object') {
        const backendErrors = errorData.errors;
        const newErrors = {};

        // Map backend field errors to form fields
        Object.keys(backendErrors).forEach(field => {
          const errorMsg = Array.isArray(backendErrors[field])
            ? backendErrors[field][0]
            : backendErrors[field];

          // Map backend field names to form field names
          const fieldMap = {
            'company_name': 'companyName',
            'block_building': 'blockBuilding',
            'mobile_number': 'phone',
            'username': 'username',
            'email': 'email',
            'alias_name': 'aliasname',
            'block': 'blockBuilding',
            'floor': 'floor'
          };

          newErrors[fieldMap[field] || field] = errorMsg;
        });

        setErrors(newErrors);
        return;
      }

      // Handle single error message
      if (errorData?.error) {
        setErrors({ general: errorData.error });
        return;
      }

      if (errorData?.message) {
        setErrors({ general: errorData.message });
        return;
      }

      // Handle specific error cases
      if (error.response?.status === 409) {
        setErrors({ general: 'User with this email already exists' });
        return;
      }

      if (error.response?.status === 400) {
        setErrors({ general: 'Invalid data provided. Please check your inputs.' });
        return;
      }

      // Default error message
      setErrors({ general: 'Failed to create user. Please try again.' });

    } finally {
      setIsSubmitting(false);
    }
  };

  // Show authentication error if not authenticated
  if (!isAuthenticated && !isInitializing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-full max-w-md p-6 m-2 bg-white rounded-lg shadow-xl">
          <div className="text-center">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Authentication Required</h2>
            <p className="mb-6 text-gray-600">You need to be logged in to add users.</p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading spinner while initializing
  if (isInitializing || loadingCompany) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-full max-w-md p-6 m-2 bg-white rounded-lg shadow-xl">
          <div className="text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-4 text-blue-600 animate-spin" />
            <p className="text-gray-600">
              {isInitializing ? 'Checking authentication...' : 'Loading company details...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-2 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Add New User</h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
            disabled={isSubmitting}
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Display success message */}
          {showSuccess && (
            <div className="flex items-center p-4 mb-4 text-green-700 bg-green-100 border border-green-300 rounded-md">
              <FaCheckCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {/* Display general error */}
          {errors.general && (
            <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
              {errors.general}
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              <FaUser className="inline w-4 h-4 mr-2" />
              User Name <span className='text-lg text-red-600'>*</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter user name"
              disabled={isSubmitting || showSuccess}
            />
            {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
          </div>

          {/* Email Field */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              <FaEnvelope className="inline w-4 h-4 mr-2" />
              Email Address <span className='text-lg text-red-600'>*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter email address"
              disabled={isSubmitting || showSuccess}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Phone Field */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              <FaPhone className="inline w-4 h-4 mr-2" />
              Mobile Number <span className='text-lg text-red-600'>*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter mobile number"
              disabled={isSubmitting || showSuccess}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
          </div>

          {/* Company Name Field */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              <FaBuilding className="inline w-4 h-4 mr-2" />
              Company Name <span className='text-lg text-red-600'>*</span>
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              readOnly
              className={`w-full px-3 py-2 border rounded-md bg-gray-50 focus:outline-none ${
                errors.companyName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={loadingCompany ? "Loading company..." : "Company name will be loaded automatically"}
            />
            {errors.companyName && <p className="mt-1 text-xs text-red-500">{errors.companyName}</p>}
          </div>

          {/* Alias Name Field (Optional) */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Alias Name
            </label>
            <input
              type="text"
              name="aliasname"
              value={formData.aliasname}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.aliasname ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter alias name (optional)"
              disabled={isSubmitting || showSuccess}
            />
            {errors.aliasname && <p className="mt-1 text-xs text-red-500">{errors.aliasname}</p>}
          </div>

          {/* Block/Building Field (Optional) */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              <FaBuilding className="inline w-4 h-4 mr-2" />
              Block/Building
            </label>
            <input
              type="text"
              name="blockBuilding"
              value={formData.blockBuilding}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.blockBuilding ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter block or building (optional)"
              disabled={isSubmitting || showSuccess}
            />
            {errors.blockBuilding && <p className="mt-1 text-xs text-red-500">{errors.blockBuilding}</p>}
          </div>

          {/* Floor Field (Optional) */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              <FaLayerGroup className="inline w-4 h-4 mr-2" />
              Floor
            </label>
            <input
              type="text"
              name="floor"
              value={formData.floor}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.floor ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter floor (optional)"
              disabled={isSubmitting || showSuccess}
            />
            {errors.floor && <p className="mt-1 text-xs text-red-500">{errors.floor}</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-4 space-x-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 transition-colors border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isSubmitting}
            >
              {showSuccess ? 'Close' : 'Cancel'}
            </button>
            {!showSuccess && (
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting || loadingCompany || !formData.companyName}
                className="flex items-center px-4 py-2 text-purple-800 transition-colors bg-transparent border border-purple-800 rounded-md hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create User'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
