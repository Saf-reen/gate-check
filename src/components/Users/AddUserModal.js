import React, { useState } from 'react';
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaIdBadge, FaBuilding, FaLayerGroup } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';
import { api } from '../Auth/api'; // Assuming same API service structure

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
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!formData.name.trim()) {
      newErrors.name = 'User name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      newErrors.name = 'Name can only contain letters and spaces';
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
    
    // Employee ID validation
    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    } else if (formData.employeeId.trim().length < 3) {
      newErrors.employeeId = 'Employee ID must be at least 3 characters long';
    }
    
    // Role validation
    if (!formData.role.trim()) {
      newErrors.role = 'Role is required';
    }

    // Company name validation
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    } else if (formData.companyName.trim().length < 2) {
      newErrors.companyName = 'Company name must be at least 2 characters long';
    }

    // User ID validation
    if (!formData.userId.trim()) {
      newErrors.userId = 'User ID is required';
    } else if (formData.userId.trim().length < 3) {
      newErrors.userId = 'User ID must be at least 3 characters long';
    } else if (!/^[a-zA-Z0-9._-]+$/.test(formData.userId.trim())) {
      newErrors.userId = 'User ID can only contain letters, numbers, dots, underscores, and hyphens';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if user ID or email already exists
  const checkUserExists = async (userId, email) => {
    try {
      const checkPayload = {
        userId: userId.trim(),
        email: email.trim()
      };

      // Assuming you have an API endpoint to check user existence
      const response = await api.user.checkExists(checkPayload);
      return response.data;
    } catch (error) {
      console.error('User existence check error:', error);
      
      // Handle different error scenarios similar to LoginForm
      if (error.response?.status === 404) {
        // User doesn't exist - this is good for creation
        return { exists: false };
      } else if (error.response?.status === 409) {
        // User already exists
        return { exists: true, field: error.response.data.field || 'userId' };
      }
      
      // For other errors, assume user doesn't exist to proceed
      return { exists: false };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // First validate form locally
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Check if user already exists
      const existsCheck = await checkUserExists(formData.userId, formData.email);
      
      if (existsCheck.exists) {
        const field = existsCheck.field || 'userId';
        const message = field === 'email' 
          ? 'A user with this email already exists' 
          : 'A user with this User ID already exists';
        
        setErrors({ [field]: message });
        setIsSubmitting(false);
        return;
      }

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
        // Add any additional fields your backend expects
        status: 'active', // Default status
        createdAt: new Date().toISOString()
      };

      console.log('Creating user with data:', userData);

      // Make API call to create user
      const response = await api.user.create(userData);
      
      if (response.data) {
        // Handle successful user creation
        const createdUser = response.data.user || response.data;
        
        console.log('User created successfully:', createdUser);
        
        // Call parent callback with created user data
        if (onUserAdded) {
          await onUserAdded(createdUser);
        }
        
        // Close modal after successful creation
        onClose();
      }
      
    } catch (error) {
      console.error('User creation error:', error);
      
      // Handle different types of errors similar to LoginForm
      let errorMessage = 'Failed to create user. Please try again.';
      const errorData = error.response?.data;
      
      if (errorData?.error) {
        errorMessage = errorData.error;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.errors) {
        // Handle validation errors object from backend
        const backendErrors = errorData.errors;
        if (typeof backendErrors === 'object') {
          const newErrors = {};
          
          // Map backend field errors to form fields
          Object.keys(backendErrors).forEach(field => {
            const errorMsg = Array.isArray(backendErrors[field]) 
              ? backendErrors[field][0] 
              : backendErrors[field];
            
            // Map backend field names to form field names if needed
            const fieldMap = {
              'user_id': 'userId',
              'employee_id': 'employeeId',
              'company_name': 'companyName',
              'block_building': 'blockBuilding'
            };
            
            newErrors[fieldMap[field] || field] = errorMsg;
          });
          
          setErrors(newErrors);
          setIsSubmitting(false);
          return;
        }
      }
      
      // Show general error message
      setErrors({ submit: errorMessage });
      
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Display general error */}
          {errors.submit && (
            <div className="p-3 border border-red-200 rounded-md bg-red-50">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              <FaUser className="inline w-4 h-4 mr-2" />
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter full name"
              disabled={isSubmitting}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Email Field */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              <FaEnvelope className="inline w-4 h-4 mr-2" />
              Email Address *
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
              disabled={isSubmitting}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Phone Field */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              <FaPhone className="inline w-4 h-4 mr-2" />
              Mobile Number *
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
              disabled={isSubmitting}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
          </div>

          {/* Employee ID Field */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              <FaIdBadge className="inline w-4 h-4 mr-2" />
              Employee ID *
            </label>
            <input
              type="text"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.employeeId ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter employee ID"
              disabled={isSubmitting}
            />
            {errors.employeeId && <p className="mt-1 text-xs text-red-500">{errors.employeeId}</p>}
          </div>

          {/* Role Field */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Role *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.role ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            >
              <option value="">Select a role</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="supervisor">Supervisor</option>
              <option value="employee">Employee</option>
            </select>
            {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role}</p>}
          </div>

          {/* Company Name Field */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              <FaBuilding className="inline w-4 h-4 mr-2" />
              Company Name *
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.companyName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter company name"
              disabled={isSubmitting}
            />
            {errors.companyName && <p className="mt-1 text-xs text-red-500">{errors.companyName}</p>}
          </div>

          {/* User ID Field */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              User ID *
            </label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.userId ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter unique user ID"
              disabled={isSubmitting}
            />
            {errors.userId && <p className="mt-1 text-xs text-red-500">{errors.userId}</p>}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter alias name (optional)"
              disabled={isSubmitting}
            />
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter block or building (optional)"
              disabled={isSubmitting}
            />
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter floor (optional)"
              disabled={isSubmitting}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-4 space-x-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 transition-colors border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;